<template>
  <div class="list-wrapper">
    <div class="all">
      <div class="list-header">
        <!-- 标题会自动根据用户角色变化 -->
        <div>{{ pageTitle }}</div>
        <hr style="margin-top: 5px;">
      </div>
      
      <!-- 滚动内容区 -->
      <div class="scrollable-content">
        <div v-if="isLoading" class="loading-state">正在加载...</div>
        <div v-else-if="array.length === 0" class="empty-state">{{ emptyMessage }}</div>
        <div v-else>
          <!-- :key 现在会根据数据结构动态选择 -->
          <div v-for="item in array" :key="item.id || item.course_id" class="cla">

            <!-- **模板 A: 教师或学生视图 (显示通知) - 完全保留** -->
            <!-- 我们使用 'title' in item 来判断当前项是否为通知 -->
            <div v-if="'title' in item" class="notice-item">
              <div class="notice-header">
                <span class="notice-title">{{ item.title }}</span>
                <span class="notice-course">发布在: {{ item.courseName }}</span>
              </div>
              <div class="notice-content">{{ item.content }}</div>
              <div class="notice-footer">
                <span v-if="userStore.user.root!='1'" class="teacher-info">发布人: {{ item.teacherName }}</span>
                <span class="publish-time">{{ item.publishTime }}</span>
              </div>
            </div>

            <!-- **模板 B: 管理员视图 (新增) - 显示课程概览** -->
            <!-- 使用 'teaching_session_count' in item 来判断 -->
            <div v-else-if="'teaching_session_count' in item" class="admin-course-item">
              <span class="course-name">{{ item.course_name }}</span>
              <div class="session-count">
                <span class="count-number">{{ item.teaching_session_count }}</span>
                <span class="count-label">个班级开课</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 1. **修改**: 引入 getAllCourses API
import { getAllCourses, getAllNoticesByStudent, getAllNoticesByTeacher } from '@/utils/api';
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

// 2. **修改**: 更新类型定义
interface Notice { id: string; title: string; content: string; courseName: string; publishTime: string; teacherName: string; }
interface AdminCourse { course_id: number; course_name: string; teaching_session_count: number; }
type DisplayItem = Notice | AdminCourse;

// 3. 初始化 Store 和响应式数据 (无需改动)
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const array = ref<DisplayItem[]>([]); 
const isLoading = ref(true);

// 4. **修改**: 更新计算属性以适应新角色
const pageTitle = computed(() => {
  switch (String(user.value.root)) {
    case '0': return '最新通知';
    case '1': return '发布的通知';
    case '2': return '课程开课总览'; // 管理员标题
    default: return '列表';
  }
});

const emptyMessage = computed(() => {
  switch (String(user.value.root)) {
    case '0': return '您还没有收到任何通知';
    case '1': return '您还没有发布任何通知';
    case '2': return '系统中还没有任何课程'; // 管理员空状态消息
    default: return '暂无内容';
  }
});

// 5. **修改**: 更新管理员的权限策略
const roleStrategies = {
  '0': { // 学生 (完全保留)
    apiCall: getAllNoticesByStudent,
    dataProcessor: (res: any): Notice[] => {
      if (res && typeof res.notices === 'object' && res.notices !== null) {
        return Object.entries(res.notices).map(([id, notice]: [string, any]) => ({ id, ...notice }))
          .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
      }
      return [];
    }
  },
  '1': { // 教师 (完全保留)
    apiCall: getAllNoticesByTeacher,
    dataProcessor: (res: any): Notice[] => {
      if (res && typeof res.notices === 'object' && res.notices !== null) {
        return Object.entries(res.notices).map(([id, notice]: [string, any]) => ({ id, ...notice }))
          .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
      }
      return [];
    }
  },
  '2': { // 管理员 (核心修改)
    apiCall: getAllCourses, // 使用获取课程的 API
    dataProcessor: (res: any): AdminCourse[] => {
      if (res && Array.isArray(res.data)) {
        // 按开课数量降序排序
        return res.data.sort((a, b) => b.teaching_session_count - a.teaching_session_count);
      }
      return [];
    }
  }
};

// 6. 封装的异步获取函数 (无需修改)
const fetchDataForRole = async (role: string | number | null) => {
  const roleKey = String(role);
  const strategy = roleStrategies[roleKey];
  if (!strategy) {
    isLoading.value = false;
    array.value = [];
    return;
  }
  
  isLoading.value = true;
  try {
    const response = await strategy.apiCall();
    array.value = strategy.dataProcessor(response);
  } catch (error) {
    console.error(`Failed to fetch data for role ${roleKey}:`, error);
    array.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 7. 侦听器 (无需修改)
watch(
  () => user.value.root,
  (newRoot) => {
    if (newRoot !== null && newRoot !== undefined) {
      fetchDataForRole(newRoot);
    } else {
      isLoading.value = false;
      array.value = [];
    }
  },
  {
    immediate: true
  }
);
</script>

<style scoped>

.list-wrapper {
  width: 100%;
  height: 100%; 
}

/* --- 1. 通用布局样式 (适用于所有页面) --- */
/* --- 1. 通用布局样式 (适用于所有页面) --- */
.all {
  width: 100%;
  height: 100%;
  padding: 20px;
  padding: 20px;
  border: 2px solid rgb(137, 214, 239);
  border-radius: 8px;
  background-color: #f9f9f9;
  box-sizing: border-box;
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
  font-size: 24px;
  font-weight: bold;
  color: #333;
  /* border-bottom: 2px solid #007bff; 统一使用蓝色主题线 */
  flex-shrink: 0;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
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

/* --- 2. 通用卡片样式 (适用于所有列表项) --- */
.cla {
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.cla:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* --- 2. 通用卡片样式 (适用于所有列表项) --- */
.cla {
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.cla:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.teacher-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notice-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}
.notice-course {
  font-size: 0.9em;
  color: #555;
}

.teacher-item .notice-content {
  color: #333;
  white-space: normal !important; 
  text-overflow: clip !important;
  overflow: visible !important;
  word-wrap: break-word;
  word-break: break-all;
}
.notice-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #777;
  margin-top: 8px;
}
.admin-item {
  display: flex;
  justify-content: space-between;
}
.admin-id {
  color: #666;
  font-size: 0.9em;
}
.admin-course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px; /* 调整内边距以适应更大的字体 */
}
.admin-course-item .course-name {
  font-size: 1.25em;
  font-weight: 600;
  color: #2c3e50;
}
.session-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-align: right;
}
.count-number {
  font-size: 2.2em;
  font-weight: 700;
  color: #007bff;
  line-height: 1;
}
.count-label {
  font-size: 0.9em;
  color: #6c757d;
}
</style>