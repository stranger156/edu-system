<template>
  <div class="all">
    <div class="list-header">
      <div>{{ pageTitle }}</div>
      <hr>
    </div>
    
    <div class="scrollable-content">
      <div v-if="isLoading" class="loading-state">正在加载作业...</div>
      <div v-else-if="assignments.length === 0" class="empty-state">{{ emptyMessage }}</div>
      <div v-else>
        <div v-for="item in assignments" :key="item.exam_id || item['练习题ID']" class="cla">

          <!-- **模板 A: 学生视图 (完全保留)** -->
          <div v-if="user.root == '0'" class="assignment-item">
            <!-- ... 学生视图的全部HTML代码保持原样 ... -->
            <div class="assignment-header">
              <span class="assignment-title">{{ item.exam_title }}</span>
              <span class="course-name">{{ item.course_name }}</span>
            </div>
            <div class="assignment-meta">
              <span class="status-label">状态:</span>
              <span class="assignment-status" :class="getStudentStatusClass(item)">{{ getDisplayStatus(item) }}</span>
            </div>
            <div class="assignment-footer">
              <span>开始: {{ item.start_time }}</span>
              <span>截止: {{ item.end_time }}</span>
            </div>
          </div>

          <!-- **模板 B: 教师视图 (完全保留)** -->
          <div v-else-if="user.root == '1'" class="teacher-assignment-item">
            <!-- ... 教师视图的全部HTML代码保持原样 ... -->
            <div class="teacher-header">
              <span class="exam-title">{{ item.exam_title }}</span>
              <div class="status-tag" :class="isEnded(item.end_time) ? 'is-ended' : 'is-ongoing'">
                {{ isEnded(item.end_time) ? '已结束' : '进行中' }}
              </div>
            </div>
            <div class="teacher-course-name">{{ item.course_name }}</div>
            <div class="submission-progress">
              <span class="progress-label">提交进度:</span>
              <span class="progress-numbers">{{ item.submission_people }} / {{ item.class_people }}</span>
            </div>
            <div class="teacher-footer">
              <span>起: {{ item.start_time }}</span>
              <span>止: {{ item.end_time }}</span>
            </div>
          </div>
          
          <!-- **模板 C: 管理员视图 (新增)** -->
          <div v-else-if="user.root == '2'" class="admin-assignment-item">
            <div class="admin-main-info">
              <div class="admin-course-name">{{ item.teacher_name }}-{{ item.course_name }}</div>
              <div class="admin-exam-title">{{ item.exam_title }}</div>
            </div>
            <div class="admin-details">
              <div class="admin-submission">
                <span>提交进度:</span>
                <span class="progress-numbers">{{ item.submission_count }} / {{ item.total_students }}</span>
              </div>
              <div class="admin-end-time">
                <span>截止于: {{ item.end_time }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 1. **修改**: 引入管理员 API
import { 
  getExam as getStudentExams, 
  get_all_exams_for_teacher as getTeacherExams,
} from '@/utils/api';
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

// 2. **修改**: 新增管理员的类型接口
interface StudentExam { '练习题ID': number; '练习题标题': string; '课程名': string; '开始时间': string; '结束时间': string; status: '已完成' | '未完成'; }
interface TeacherExam { exam_id: number; exam_title: string; course_name: string; start_time: string; end_time: string; class_people: number; submission_people: number; }
interface AdminExam extends TeacherExam { Cno?: number; Tno?: number; } // 假设 Cno 和 Tno 是可选的
type Assignment = StudentExam | TeacherExam | AdminExam;

// 3. 初始化状态 (无需改动)
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const assignments = ref<Assignment[]>([]);
const isLoading = ref(true);

// 4. **修改**: 为计算属性增加管理员分支
const pageTitle = computed(() => {
  if (user.value.root == '0') return '我的作业';
  if (user.value.root == '1') return '我发布的作业';
  if (user.value.root == '2') return '全站作业总览';
  return '作业区';
});
const emptyMessage = computed(() => {
  if (user.value.root == '0') return '恭喜，暂无待完成的作业！';
  if (user.value.root == '1') return '您还没有发布任何作业';
  if (user.value.root == '2') return '系统中暂无作业';
  return '暂无内容';
});

// 5. 保留学生视图的辅助函数 (无需改动)
const isEnded = (endTime: string): boolean => !!endTime && new Date() > new Date(endTime);
const getDisplayStatus = (item: StudentExam): string => {
  if (item.status === '已完成') return '已完成';
  return isEnded(item['结束时间']) ? '已错过' : '待完成';
};
const getStudentStatusClass = (item: StudentExam) => ({
  'status-completed': getDisplayStatus(item) === '已完成',
  'status-pending': getDisplayStatus(item) === '待完成',
  'status-missed': getDisplayStatus(item) === '已错过',
});

// 6. **核心修改**: 在权限策略中新增管理员的逻辑
const roleStrategies = {
  '0': { // 学生策略 (完全保留)
    apiCall: getStudentExams,
    dataProcessor: (res: any): StudentExam[] => {
      const data = res?.data || [];
      data.sort((a, b) => {
        const priority = { '待完成': 3, '已完成': 2, '已错过': 1 };
        const aStatus = getDisplayStatus(a), bStatus = getDisplayStatus(b);
        if (priority[aStatus] !== priority[bStatus]) return priority[bStatus] - priority[aStatus];
        return new Date(a['结束时间']).getTime() - new Date(b['结束时间']).getTime();
      });
      return data;
    }
  },
  '1': { // 教师策略 (完全保留)
    apiCall: getTeacherExams,
    dataProcessor: (res: any): TeacherExam[] => {
      const data = res?.data || [];
      data.sort((a, b) => 
        (isEnded(a.end_time) ? 1 : -1) - (isEnded(b.end_time) ? 1 : -1) || 
        new Date(a.end_time).getTime() - new Date(b.end_time).getTime()
      );
      return data;
    }
  },
  '2': { // 管理员策略 (新增)
    apiCall: getTeacherExams,
    dataProcessor: (res: any): AdminExam[] => {
        const data = res?.data || [];
        // **按 Cno 和 Tno 排序**
        data.sort((a, b) => {
            // 首先比较 Cno (如果存在)
            if (a.Cno && b.Cno && a.Cno !== b.Cno) {
                return a.Cno - b.Cno;
            }
            // 如果 Cno 相同或不存在，则比较 Tno (如果存在)
            if (a.Tno && b.Tno && a.Tno !== b.Tno) {
                return a.Tno - b.Tno;
            }
            // 如果上述都相同或不存在，则按截止日期排序
            return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        });
        return data;
    }
  }
};

// 7. 封装的异步获取函数 (无需改动)
const fetchDataForRole = async (role: string | number | null) => {
  const roleKey = String(role);
  const strategy = roleStrategies[roleKey];
  if (!strategy) { isLoading.value = false; assignments.value = []; return; }
  isLoading.value = true;
  try {
    const response = await strategy.apiCall();
    assignments.value = strategy.dataProcessor(response);
  } catch (error) {
    console.error(`Failed to fetch assignments for role ${roleKey}:`, error);
    assignments.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 8. 侦听器 (无需改动)
watch(() => user.value.root, (newRoot) => {
  if (newRoot !== null && newRoot !== undefined) {
    fetchDataForRole(newRoot);
  } else {
    isLoading.value = false;
    assignments.value = [];
  }
}, { immediate: true });
</script>
<style scoped>
/* --- 基础布局和容器样式 --- */
/* --- 基础布局和容器样式 --- */
.all {
  width: 100%;
  height: 100%;
  padding: 20px;
  padding: 20px;
  border: 2px solid rgb(39, 155, 194);
  border-radius: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.list-header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
  flex-shrink: 0;
}
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 15px;
  padding-top: 15px;
}
.loading-state, .empty-state {
  text-align: center;
  padding-top: 50px;
  font-size: 16px;
  padding-top: 50px;
  font-size: 16px;
  color: #888;
}

/* --- 作业卡片样式 --- */
/* --- 作业卡片样式 --- */
.cla {
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  cursor: pointer;
}
.cla:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.assignment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  gap: 12px;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #005f73;
  font-size: 1.2em;
  font-weight: 600;
  color: #005f73;
}

.course-name {
.course-name {
  font-size: 0.9em;
  color: #fff;
  background-color: #5a67d8;
  padding: 3px 10px;
  color: #fff;
  background-color: #5a67d8;
  padding: 3px 10px;
  border-radius: 12px;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
    font-size: 1em;
    color: #555;
}

.assignment-status {
  font-size: 0.95em;
  padding: 4px 12px;
  border-radius: 15px;
  color: white;
  align-items: center;
  gap: 8px;
}

.status-label {
    font-size: 1em;
    color: #555;
}

.assignment-status {
  font-size: 0.95em;
  padding: 4px 12px;
  border-radius: 15px;
  color: white;
  font-weight: 500;
}

/* --- 动态状态颜色 --- */
.status-completed {
  background-color: #28a745; /* 已完成 - 绿色 */
}
.status-pending {
  background-color: #ffc107; /* 待完成 - 黄色 */
  color: #333;
}
.status-missed {
  background-color: #dc3545; /* 已错过 - 红色 */
}

/* --- 动态状态颜色 --- */
.status-completed {
  background-color: #28a745; /* 已完成 - 绿色 */
}
.status-pending {
  background-color: #ffc107; /* 待完成 - 黄色 */
  color: #333;
}
.status-missed {
  background-color: #dc3545; /* 已错过 - 红色 */
}

.assignment-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #666;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}
.teacher-assignment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.teacher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.teacher-course-name {
  font-size: 1em;
  color: #555;
  margin-top: 4px;
}
.submission-progress {
  background-color: #f0f2f5;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 1em;
}
.progress-label {
  color: #333;
}
.progress-numbers {
  font-weight: 600;
  margin-left: 8px;
  color: #007bff;
}
.teacher-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #666;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}
.exam-title { /* 复用学生视图的标题样式 */
  font-size: 1.2em;
  font-weight: 600;
  color: #005f73;
}
.status-tag { /* 新增状态标签样式 */
  font-size: 0.9em;
  padding: 4px 12px;
  border-radius: 15px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
}
.status-tag.is-ongoing {
  background-color: #28a745; /* 进行中 - 绿色 */
}
.status-tag.is-ended {
  background-color: #6c757d; /* 已结束 - 灰色 */
}
.admin-assignment-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.admin-main-info {
  /* 主要信息区 */
}
.admin-course-name {
  font-size: 1.4em; /* 大字体 */
  font-weight: 700;
  color: #2c3e50;
}
.admin-exam-title {
  font-size: 1.1em; /* 中等字体 */
  color: #555;
  margin-top: 4px;
}
.admin-details {
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.admin-submission {
  font-size: 1em;
  background-color: #f8f9fa;
  padding: 5px 10px;
  border-radius: 6px;
}
.admin-end-time {
  font-size: 0.85em; /* 小字体 */
  color: #888;
}
</style>