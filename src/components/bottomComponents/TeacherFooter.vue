<!-- TeacherStatsDashboard.vue -->
<template>
  <div class="dashboard-container">
    <div class="main-content">
      
      <!-- **左侧栏：课程列表** -->
      <div class="stats-column">
        <div class="column-header">
          <h3>课程详情</h3>
        </div>
        <div class="list-scroll-area">
          <div v-if="isLoadingCourses" class="loading-spinner"></div>
          <ul v-else class="stats-list">
            <!-- **增加 @click 事件处理器** -->
            <li 
              v-for="course in courses" 
              :key="course.course_id" 
              class="stats-item clickable"
              :class="{ 'is-active': selectedCourse && selectedCourse.course_id === course.course_id }"
              @click="handleCourseSelect(course)"
            >
              <div class="course-info">
                <span class="course-name">{{ course.course_name }}</span>
                <span class="student-count">{{ course.student_count }} 名学生</span>
              </div>
              <div class="course-stats">
                <div class="stat-item">
                  <span class="stat-value" :style="{ color: getScoreColor(course.average_accuracy) }">
                    {{ course.average_accuracy.toFixed(1) }}%
                  </span>
                  <span class="stat-label">平均正确率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">
                    {{ parseFloat(course.completion_rate).toFixed(1) }}%
                  </span>
                  <span class="stat-label">提交率</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- **中间的分割线** -->
      <div class="divider"></div>

      <!-- **右侧栏：学生列表 (内容动态变化)** -->
      <div class="stats-column">
        <div class="column-header">
          <!-- 标题会根据是否选择了课程而变化 -->
          <h3 v-if="selectedCourse">《{{ selectedCourse.course_name }}》学生学情</h3>
          <h3 v-else>学生详情</h3>
        </div>
        <div class="list-scroll-area">
          <div v-if="isLoadingStudents" class="loading-spinner"></div>
          <!-- 默认提示 -->
          <div v-else-if="!selectedCourse" class="placeholder">
            请从左侧选择一门课程查看学生详情
          </div>
          <div v-else-if="students.length === 0" class="placeholder">
            该课程暂无学生数据
          </div>
          <ul v-else class="stats-list">
            <li v-for="student in students" :key="student.student_id" class="stats-item">
              <span class="student-name">{{ student.student_name }}</span>
              <div class="student-stats">
                 <div class="stat-item">
                  <span class="stat-value" :style="{ color: getScoreColor(student.average_accuracy) }">
                    {{ student.average_accuracy.toFixed(1) }}%
                  </span>
                  <span class="stat-label">平均正确率</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">
                    {{ parseFloat(student.completion_rate).toFixed(1) }}%
                  </span>
                  <span class="stat-label">完成率</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getTeacherCourseStats, getStudentsStatsByCourse } from '@/utils/api';

// --- 接口定义 (无变化) ---
interface CourseStat {
  course_id: number;
  course_name: string;
  average_accuracy: number;
  completion_rate: string;
  student_count: number;
  teacher_id: number;
}
interface StudentStat {
  student_id: number;
  student_name: string;
  average_accuracy: number;
  completion_rate: string;
}

// --- 响应式状态 (无变化) ---
const courses = ref<CourseStat[]>([]);
const students = ref<StudentStat[]>([]);
const selectedCourse = ref<CourseStat | null>(null);
const isLoadingCourses = ref(true);
const isLoadingStudents = ref(false);

// --- 获取学生数据的函数 (无变化) ---
const fetchStudentsForCourse = async (course: CourseStat) => {
  if (!course) return;
  isLoadingStudents.value = true;
  students.value = [];
  try {
    const res = await getStudentsStatsByCourse(course.course_id, course.teacher_id);
    if (res.code === 200 && Array.isArray(res.data)) {
      students.value = res.data.sort((a, b) => b.average_accuracy - a.average_accuracy);
    }
  } catch (error) {
    console.error("Failed to fetch students stats:", error);
  } finally {
    isLoadingStudents.value = false;
  }
};

// --- **核心修改 1: 优化点击处理函数** ---
const handleCourseSelect = (course: CourseStat) => {
  // 如果点击的是当前已经选中的课程，则不执行任何操作，避免重复加载
  if (selectedCourse.value && selectedCourse.value.course_id === course.course_id) {
    return;
  }
  
  // 更新选中的课程，并获取该课程的学生数据
  selectedCourse.value = course;
  fetchStudentsForCourse(course);
};

// --- 辅助函数 (无变化) ---
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#28a745';
  if (score >= 80) return '#007bff';
  if (score >= 60) return '#fd7e14';
  return '#dc3545';
};

// --- **核心修改 2: 调整 onMounted 初始化逻辑** ---
onMounted(async () => {
  isLoadingCourses.value = true;
  
  // **重置右侧栏状态**
  selectedCourse.value = null; // 清空已选中的课程
  students.value = [];        // 清空学生列表
  
  try {
    const res = await getTeacherCourseStats();
    if (res.code === 200 && Array.isArray(res.data)) {
      courses.value = res.data.sort((a, b) => b.average_accuracy - a.average_accuracy);
      
      // **移除自动加载第一个课程学生数据的逻辑**
      // 我们不再在这里调用 handleCourseSelect
    }
  } catch (error) {
    console.error("Failed to fetch teacher course stats:", error);
  } finally {
    isLoadingCourses.value = false;
  }
});
</script>

<style scoped>
/* --- 基础布局 (与之前类似，但有微调) --- */
.dashboard-container { width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; background-color: #f8f9fa; }
.main-content { flex-grow: 1; display: flex; min-height: 0; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
.stats-column { flex: 1; display: flex; flex-direction: column; padding: 20px; min-width: 0; }
.column-header { flex-shrink: 0; padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid #e9ecef; }
.column-header h3 { margin: 0; font-size: 18px; color: #343a40; }
.list-scroll-area { flex-grow: 1; overflow-y: auto; min-height: 0; }
.divider { width: 1px; background-color: #e9ecef; margin: 20px 0; }
.loading-spinner, .placeholder { height: 100%; display: flex; justify-content: center; align-items: center; color: #888; font-size: 15px; }
.loading-spinner::after { content: ''; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- 列表和列表项 --- */
.stats-list { list-style-type: none; padding: 0; margin: 0; }
.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 10px;
  border-bottom: 1px solid #f2f5f8;
  transition: background-color 0.2s;
}
.stats-item.clickable { cursor: pointer; }
.stats-item.clickable:hover { background-color: #f8f9fa; }
.stats-item.is-active { background-color: #e7f5ff; border-left: 3px solid #007bff; padding-left: 7px; }

/* --- 左侧课程列表项 --- */
.course-info { display: flex; flex-direction: column; gap: 4px; }
.course-name { font-size: 16px; font-weight: 600; color: #212529; }
.student-count { font-size: 13px; color: #6c757d; }
.course-stats, .student-stats { display: flex; gap: 20px; text-align: right; }
.stat-item { display: flex; flex-direction: column; align-items: flex-end; }
.stat-value { font-size: 18px; font-weight: bold; }
.stat-label { font-size: 12px; color: #888; }

/* --- 右侧学生列表项 --- */
.student-name { font-size: 16px; font-weight: 500; color: #343a40; flex-grow: 1; }
</style>