<template>
  <div class="all">
    <div class="list-header">
      <div>{{ pageTitle }}</div>
      <hr>
    </div>
    
    <div class="scrollable-content">
      <div v-if="isLoading" class="loading-state">正在加载作业...</div>
      <div v-else-if="assignments.length === 0 && user.root!='2'" class="empty-state">{{ emptyMessage }}</div>
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
              <span class="progress-numbers">{{ item.submission_count }} / {{ item.total_students}}</span>
            </div>
            <div class="teacher-footer">
              <span>起: {{ item.start_time }}</span>
              <span>止: {{ item.end_time }}</span>
            </div>
          </div>
        </div>
        <!-- **修改: 管理员视图** -->
          <div v-if="user.root === '2'" class="admin-dashboard">
            <!-- **新增: 今日使用统计卡片** -->
            <div class="stats-card-row">
              <div class="stat-card">
                <div class="stat-title">今日教师使用次数</div>
                <div class="stat-value">{{ dailyUsage.teacher_usage_count }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">今日学生使用次数</div>
                <div class="stat-value">{{ dailyUsage.student_usage_count }}</div>
              </div>
            </div>

            <!-- **新增: 教师使用排名图表** -->
            <div class="chart-card">
              <div class="chart-header">教师使用次数 Top 5</div>
              <div ref="chartRef" class="chart-container"></div>
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
  getDailyUsageStats,      // 新增
  getTeacherUsageRanking   // 新增
} from '@/utils/api';
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';
import * as echarts from 'echarts';

// 2. **修改**: 新增管理员的类型接口
interface StudentExam { '练习题ID': number; '练习题标题': string; '课程名': string; '开始时间': string; '结束时间': string; status: '已完成' | '未完成'; }
interface TeacherExam { exam_id: number; exam_title: string; course_name: string; start_time: string; end_time: string; class_people: number; submission_people: number; }
type Assignment = StudentExam | TeacherExam;

// 3. 初始化状态 (无需改动)
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const assignments = ref<Assignment[]>([]);
const isLoading = ref(true);

const dailyUsage = ref({ teacher_usage_count: 0, student_usage_count: 0 });
const teacherRanking = ref<{ teacher_name: string; usage_count: number }[]>([]);
const chartRef = ref<HTMLElement | null>(null); // 用于引用图表容器DOM
let myChart: echarts.ECharts | null = null; // 用于存储 ECharts 实例

// 4. **修改**: 为计算属性增加管理员分支
const pageTitle = computed(() => {
  if (user.value.root == '0') return '我的作业';
  if (user.value.root == '1') return '我发布的作业';
  if (user.value.root == '2') return '今日统计';
  return '作业区';
});
const emptyMessage = computed(() => {
  if (user.value.root == '0') return '恭喜，暂无待完成的作业！';
  if (user.value.root == '1') return '您还没有发布任何作业';
  if (user.value.root == '2') return '系统中暂无统计信息';
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

const initChart = () => {
   if (!chartRef.value) {
    if (myChart) {
      myChart.dispose();
      myChart = null;
    }
    return;
  }
  if (chartRef.value && teacherRanking.value.length > 0) {
    // 如果 ECharts 实例已存在，先销毁
    if (myChart) {
      myChart.dispose();
    }
    myChart = echarts.init(chartRef.value);
    
    const top5Teachers = teacherRanking.value;
    
    const option = {
      grid: {
        top: '15%',    // 绘图区离容器顶部 15%
        bottom: '10%', // 绘图区离容器底部 10%
        left: '3%',    // 绘图区离容器左侧 3%
        right: '4%',   // 绘图区离容器右侧 4%
        containLabel: true // **关键**: 自动计算坐标轴标签的尺寸，防止其溢出
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: top5Teachers.map(t => t.teacher_name)
      },
       yAxis: { 
        type: 'value', 
        name: '使用次数',
        
        // **1. 减少纵坐标刻度数量**
        //    建议 ECharts 将y轴大致分成 5 个区间 (可能会是 4, 5, 或 6 个刻度)
        splitNumber: 3,
        
        // **2. 消除背景条纹**
        //    不显示 y 轴的网格分隔线
        splitLine: {
          show: false 
        }
      },
      series: [{
        name: '使用次数',
        type: 'bar',
        data: top5Teachers.map(t => t.usage_count),
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    };
    myChart.setOption(option);
  }
};
watch(teacherRanking, async (newRanking, oldRanking) => {
  // 我们只在数据从“无”到“有”时，或者数据内容发生变化时才渲染
  if (newRanking && newRanking.length > 0) {
    console.log("Teacher ranking data changed, initializing chart...");
    // 等待 v-if 渲染出 DOM
    await nextTick();
    initChart();
  }
}, { deep: true }); // deep 确保即使是数组内部变化也能被侦测到

// --- (可选但强烈推荐) 窗口大小自适应和组件销毁 ---
const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
  }
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
  }
};

const fetchDataForRole = async (role: string | null) => {
  const roleKey = String(role);
  isLoading.value = true;
  assignments.value = []; // 重置旧数据
  
  try {
    if (roleKey === '0') {
      const res = await getStudentExams();
      assignments.value = (res?.data || []).sort(/* ...学生排序逻辑... */);
    } else if (roleKey === '1') {
      const res = await getTeacherExams();
      assignments.value = (res?.data || []).sort(/* ...老师排序逻辑... */);
    } else if (roleKey === '2') {
      // **管理员并行获取两个统计接口**
      const [usageRes, rankingRes] = await Promise.all([
        getDailyUsageStats(),
        getTeacherUsageRanking()
      ]);
      if (usageRes.code === 200) dailyUsage.value = usageRes.data;
      if (rankingRes.code === 200) teacherRanking.value = rankingRes.data;
      teacherRanking.value = rankingRes.data.slice(0, 5);
      console.log(teacherRanking.value)
    }
  } catch (error) {
    console.error(`Failed to fetch data for role ${roleKey}:`, error);
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
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}
.stats-card-row {
  display: flex;
  gap: 20px;
  /* **新增**: 让这一行的高度由内容决定，不要拉伸 */
  flex-shrink: 0; 
}
.stat-card {
  flex: 1;
  background-color: #ffffff;
  /* **修改 1**: 减小内边距来降低整体高度 */
  padding: 5px; 
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  text-align: center;
}
.stat-title {
  font-size: 14px; /* 减小标题字号 */
  color: #6c757d;
  margin-bottom: 5px; /* 减小间距 */
}
.stat-value {
  font-size: 32px; /* 减小数字字号 */
  font-weight: bold;
  color: #007bff;
}
.chart-card {
  background-color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 20vh;
}
.chart-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px; /* 减小间距 */
  flex-shrink: 0; /* 不允许标题被压缩 */
}
.chart-container {
  width: 100%;
  /* **修改 2**: 不再使用固定高度，而是让它填满父容器 */
  height: 100%; 
  flex-grow: 1; /* 占据图表卡片内的所有剩余垂直空间 */
}
</style>