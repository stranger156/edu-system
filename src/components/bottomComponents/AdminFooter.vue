<template>
  <div class="dashboard-container">
    <div class="main-content">
      
      <!-- **左侧栏：课程列表** -->
      <div class="stats-column">
        <div class="column-header">
          <h3>课程总览</h3>
          <!-- **新增：可点击的排序表头** -->
          <div class="sort-headers">
            <span 
              @click="setSortKey('average_accuracy')" 
              :class="{ active: sortKey === 'average_accuracy' }"
            >
              按正确率 {{ sortKey === 'average_accuracy' ? (sortOrder === 'desc' ? '↓' : '↑') : '' }}
            </span>
            <span 
              @click="setSortKey('completion_rate')" 
              :class="{ active: sortKey === 'completion_rate' }"
            >
              按通过率 {{ sortKey === 'completion_rate' ? (sortOrder === 'desc' ? '↓' : '↑') : '' }}
            </span>
          </div>
        </div>
        <div class="list-scroll-area">
          <div v-if="isLoadingCourses" class="loading-spinner"></div>
          <!-- **渲染的是排序后的计算属性 sortedCourses** -->
          <ul v-else class="stats-list">
            <li 
              v-for="course in sortedCourses" 
              :key="`${course.course_id}-${course.teacher_id}`" 
              class="stats-item clickable"
              :class="{ 'is-active': selectedId === course.id }"
              @click="handleCourseSelect(course)"
            >
              <div class="course-info">
                <!-- **显示 老师-课程** -->
                <span class="course-name">{{ course.teacher_name }} - {{ course.course_name }}</span>
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
                  <span class="stat-label">通过率</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- **中间的分割线** -->
      <div class="divider"></div>

      <!-- **右侧栏：学生列表** -->
      <div class="stats-column">
        <div class="column-header">
          <!-- **核心修改 2: 标题现在需要从一个计算属性获取** -->
          <h3 v-if="selectedCourseDetails">《{{ selectedCourseDetails.course_name }}》学生学情</h3>
          <h3 v-else>学生学情</h3>
        </div>
        <div class="list-scroll-area">
          <div v-if="isLoadingStudents" class="loading-spinner"></div>
          <div v-else-if="!selectedId" class="placeholder">请从左侧选择一门课程查看学生详情</div>
          <div v-else-if="students.length === 0" class="placeholder">该课程暂无学生数据</div>
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
import { ref, onMounted, computed } from 'vue';
import { getTeacherCourseStats, getStudentsStatsByCourse } from '@/utils/api';

// --- 类型定义 ---
interface CourseStat {
  id: string;
  course_id: number;
  course_name: string;
  average_accuracy: number;
  completion_rate: string;
  student_count: number;
  teacher_id: number;
  teacher_name: string; 
}
interface StudentStat {
  student_id: number;
  student_name: string;
  average_accuracy: number;
  completion_rate: string;
}
const selectedId = ref<string | null>(null);
// --- 响应式状态 ---
const courses = ref<CourseStat[]>([]);
const students = ref<StudentStat[]>([]);
const isLoadingCourses = ref(true);
const isLoadingStudents = ref(false);
const sortKey = ref<'average_accuracy' | 'completion_rate'>('average_accuracy');
const sortOrder = ref<'asc' | 'desc'>('desc');

const selectedCourseDetails = computed(() => {
  if (!selectedId.value) return null;
  // 从原始的 courses 数组中查找
  return courses.value.find(c => c.id === selectedId.value) || null;
});
// --- 动态排序的计算属性 ---
const sortedCourses = computed(() => {
  return [...courses.value].sort((a, b) => {
    const key = sortKey.value;
    const valA = key === 'completion_rate' ? parseFloat(a[key]) : a[key];
    const valB = key === 'completion_rate' ? parseFloat(b[key]) : b[key];
    return sortOrder.value === 'desc' ? valB - valA : valA - valB;
  });
});

// --- 事件和逻辑处理函数 ---
const setSortKey = (key: 'average_accuracy' | 'completion_rate') => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }
};

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

const handleCourseSelect = (course: CourseStat) => {
  // 判断点击的是否是同一个
  if (selectedId.value === course.id) {
    // 如果是，可以选择取消选中
    // selectedId.value = null;
    // students.value = [];
    return;
  }
  
  // 更新选中的 ID
  selectedId.value = course.id;
  
  // 传入完整的 course 对象去获取学生列表
  fetchStudentsForCourse(course);
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#28a745';
  if (score >= 80) return '#007bff';
  if (score >= 60) return '#fd7e14';
  return '#dc3545';
};

// --- 生命周期钩子 ---
onMounted(async () => {
  isLoadingCourses.value = true;
  selectedId.value = null;
  students.value = [];
  try {
    const res = await getTeacherCourseStats();
    if (res.code === 200 && Array.isArray(res.data)) {
      courses.value = res.data.map(course => ({
        ...course,
        id: `c${course.course_id}-t${course.teacher_id}`
      }));
      courses.value.forEach(element => {
        console.log("数据"+element.course_id+"-"+element.teacher_id)
      });
      // 初始加载时不自动选择第一个，等待用户交互
    }
  } catch (error) {
    console.error("Failed to fetch admin course stats:", error);
  } finally {
    isLoadingCourses.value = false;
  }
});
</script>

<style scoped>
/* --- 基础布局 --- */
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

/* --- 排序表头 --- */
.sort-headers { display: flex; gap: 20px; margin-top: 10px; font-size: 13px; color: #6c757d; }
.sort-headers span { cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background-color 0.2s, color 0.2s; }
.sort-headers span:hover { background-color: #f0f2f5; }
.sort-headers span.active { color: #007bff; font-weight: 600; }

/* --- 列表和列表项 --- */
.stats-list { list-style-type: none; padding: 0; margin: 0; }
.stats-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #f2f5f8; }
.stats-item.clickable { cursor: pointer; }
.stats-item.clickable:hover { background-color: #f8f9fa; }
.stats-item.is-active { background-color: #e7f5ff; border-left: 3px solid #007bff; padding-left: 7px; }
.course-info { display: flex; flex-direction: column; gap: 4px; }
.course-name { font-size: 16px; font-weight: 600; color: #212529; }
.student-count { font-size: 13px; color: #6c757d; }
.course-stats, .student-stats { display: flex; gap: 20px; text-align: right; }
.stat-item { display: flex; flex-direction: column; align-items: flex-end; }
.stat-value { font-size: 18px; font-weight: bold; }
.stat-label { font-size: 12px; color: #888; }
.student-name { font-size: 16px; font-weight: 500; color: #343a40; flex-grow: 1; }
</style>