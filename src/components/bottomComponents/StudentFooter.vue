<!-- CourseStatsDashboard.vue -->
<template>
  <div class="dashboard-container">

    <!-- **3. 主内容区：双栏布局的核心** -->
    <!--    它将是一个水平排列的 Flex 容器，并占据所有剩余空间 -->
    <div class="main-content">
      
      <!-- **左侧栏** -->
      <div class="stats-column">
        <!-- a. 固定的列标题 -->
        <div class="column-header">
          <h3>课程完成率</h3>
        </div>
        <!-- b. 可独立滚动的内容区 -->
        <div class="list-scroll-area">
          <div v-if="isLoading" class="loading-spinner"></div>
          <ul v-else class="stats-list">
            <li v-for="course in completionList" :key="course.courseId" class="stats-item">
              <span class="course-name">{{ course.courseName }}</span>
              <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: course.completionRate + '%' }"></div>
              </div>
              <span class="percentage">{{ course.completionRate.toFixed(1) }}%</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- **中间的分割线 (垂直)** -->
      <div class="divider"></div>

      <!-- **右侧栏** -->
      <div class="stats-column">
        <!-- a. 固定的列标题 -->
        <div class="column-header">
          <h3>课程平均正确率</h3>
        </div>
        <!-- b. 可独立滚动的内容区 -->
        <div class="list-scroll-area">
          <div v-if="isLoading" class="loading-spinner"></div>
          <ul v-else class="stats-list">
            <li v-for="course in averageScoreList" :key="course.courseId" class="stats-item">
              <span class="course-name">{{ course.courseName }}</span>
              <span class="score" :style="{ color: getScoreColor(course.averageAccuracy) }">
                {{ course.averageAccuracy.toFixed(1) }}
              </span>
              <span class="score-label">%</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
// 1. **修改**: 引入您学生获取学情统计的真实 API
import { getStudentCourseStats } from '@/utils/api'; // 假设 API 函数名为这个

// --- 2. 修改: 为后端响应数据定义精确的类型接口 ---
interface ApiCourseStat {
  course_id: number;
  course_name: string;
  my_average_accuracy: number;
  my_completion_rate: string; // **注意**: 后端返回的是字符串
  teacher_id: number;
  teacher_name: string;
}

// --- 3. 为模板定义一个统一的、干净的数据接口 ---
//    这是我们“适配层”的目标格式
interface TemplateCourseStat {
  courseId: number;
  courseName: string;
  completionRate: number; // **注意**: 我们需要的是数字
  averageAccuracy: number;
}

// --- 4. 响应式状态 ---
//    这个 ref 将存储从 API 获取的原始数据
const rawStatsData = ref<ApiCourseStat[]>([]);
const isLoading = ref(true);

// --- 5. 核心修改: 创建一个计算属性作为“数据适配层” ---
const processedStats = computed((): TemplateCourseStat[] => {
  // 当原始数据变化时，这个计算属性会自动重新计算
  return rawStatsData.value.map(apiItem => {
    // 对每一条从后端来的数据，进行转换和映射
    return {
      courseId: apiItem.course_id,
      courseName: apiItem.course_name,
      // **关键**: 将字符串类型的完成率转换为数字
      // 使用 parseFloat 确保转换的健壮性，如果转换失败则默认为 0
      completionRate: parseFloat(apiItem.my_completion_rate) || 0,
      averageAccuracy: apiItem.my_average_accuracy,
    };
  });
});

// --- 6. 修改: 让排序列表基于处理后的数据 ---
// a. 完成率列表 (降序)
const completionList = computed(() => {
  return [...processedStats.value].sort((a, b) => b.completionRate - a.completionRate);
});

// b. 平均分列表 (降序)
const averageScoreList = computed(() => {
  return [...processedStats.value].sort((a, b) => b.averageAccuracy - a.averageAccuracy);
});

// --- 7. 辅助函数 (无需改动) ---
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#28a745';
  if (score >= 80) return '#007bff';
  if (score >= 60) return '#fd7e14';
  return '#dc3545';
};

// --- 8. 修改: 生命周期钩子调用真实 API ---
onMounted(async () => {
  isLoading.value = true;
  try {
    // **调用真实的 API**
    const response = await getStudentCourseStats();
    
    // **健壮地处理响应**
    if (response && response.code === 200 && Array.isArray(response.data)) {
      rawStatsData.value = response.data; 
    } else {
      console.warn("API response is not in the expected format:", response);
    }
  } catch (error) {
    console.error("Failed to fetch course stats:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* --- 1. 根容器 (负责左右布局) --- */
.dashboard-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row; 
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-width: 0;
}

/* --- 2. 左右两栏的通用样式 --- */
.stats-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 0;
  min-height: 0;
}

/* --- 3. 固定的列标题 --- */
.column-header {
  flex-shrink: 0;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}
.column-header h3 { margin: 0; font-size: 18px; color: #343a40; }

/* --- 4. 独立滚动区 --- */
.list-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
}
.list-scroll-area::-webkit-scrollbar { width: 6px; }
.list-scroll-area::-webkit-scrollbar-thumb { background-color: #ced4da; border-radius: 3px; }

/* --- 5. 中间的分割线 --- */
.divider {
  width: 1px;
  background-color: #e9ecef;
  margin: 20px 0;
  flex-shrink: 0;
}

/* --- 6. 列表和加载动画的样式 --- */
.stats-list { list-style-type: none; padding: 0; margin: 0; }
.stats-item { display: flex; align-items: center; padding: 15px 5px; border-bottom: 1px solid #f2f5f8; }
.stats-item:last-child { border-bottom: none; }

/* --- **核心修正** --- */
.course-name {
  flex-grow: 1; /* **关键**: 占据所有可用的剩余空间 */
  flex-shrink: 1; /* 允许在空间不足时收缩 */
  min-width: 0;   /* 防止内容溢出，并确保 flex 属性正常工作 */
  
  font-size: 15px;
  color: #34495e;
}
/* --- 修正结束 --- */

/* --- 8. 列表和加载动画的样式 (与之前相同，无需修改) --- */
.stats-list { list-style-type: none; padding: 0; margin: 0; }
.stats-item { display: flex; align-items: center; padding: 15px 5px; border-bottom: 1px solid #f2f5f8; }
.stats-item:last-child { border-bottom: none; }
.course-name { flex-grow: 1; font-size: 15px; color: #34495e; }
.progress-bar-container { width: 100px; height: 6px; background-color: #e9ecef; border-radius: 3px; margin: 0 15px; }
.progress-bar { height: 100%; background-image: linear-gradient(90deg, #007bff, #00bfff); border-radius: 3px; }
.percentage { width: 50px; text-align: right; font-size: 15px; font-weight: bold; color: #007bff; }
.score { font-size: 18px; font-weight: bold; }
.score-label { font-size: 13px; color: #6c757d; margin-left: 4px; }
.loading-spinner { display: flex; justify-content: center; align-items: center; height: 100%; }
.loading-spinner::after { content: ''; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>