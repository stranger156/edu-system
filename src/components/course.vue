<template>
  <div class="all">
    <div class="list-header"><div>{{ pageTitle }}</div><hr></div>
    <div class="scrollable-content">
      <div v-if="isLoading" class="loading-state">正在加载...</div>
      <div v-else-if="array.length === 0" class="empty-state">{{ emptyMessage }}</div>
      <div v-else>
        <!-- :key 现在使用一个更唯一的组合键，防止重复 -->
        <div v-for="item in array" :key="`${item.courseID}-${item.Tno || 0}`" class="cla">
          <div class="course-item">
            <div class="course-title">{{ item.courseName }}</div>
            
            <!-- A. 学生视图：只显示老师姓名 -->
            <div v-if="user.root == '0' && item.teacherName" class="teacher-name">
              授课教师: {{ item.teacherName }}
            </div>
            
            <!-- B. 管理员视图：显示老师姓名和Tno -->
            <!--    我们假设非管理员视图的数据中没有 Tno 字段 -->
            <div v-if="user.root == '2' && item.teacherName" class="teacher-name">
              授课教师: {{ item.teacherName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAllCourses, getAllLectures, getCourseByStudent, getTeacherLectures } from '@/utils/api';
import { onMounted, ref, computed, watch } from 'vue'; // 1. 引入 watch
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

// --- 1. 初始化 Store 和响应式数据 ---
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isLoading = ref(true);
const array = ref([]);

// --- 2. 计算属性 (无需修改) ---
const pageTitle = computed(() => {
  // 使用宽松比较 `==` 来避免数字和字符串类型不匹配的问题
  if (user.value.root == '0') return '我学的课';
  if (user.value.root == '1') return '我教的课';
  if (user.value.root == '2') return '所有课程';
  return '课程列表';
});

const emptyMessage = computed(() => {
  if (user.value.root == '0') return '您还没有选择任何课程';
  if (user.value.root == '1') return '您还没有创建任何课程';
  if (user.value.root == '2') return '系统中还没有任何课程';
  return '暂无课程';
});

// --- 3. 核心数据获取逻辑 (封装成一个函数) ---
const fetchCourses = async () => {
  if (user.value.root === null || user.value.root === undefined) {
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  array.value = [];

  try {
    let response;
    // 根据角色调用不同的 API
    if (user.value.root == '0') {
      response = await getCourseByStudent();
      array.value = response.courses || [];
    } else if (user.value.root == '1') {
      response = await getTeacherLectures();
      array.value = response.lectures || [];
    } else if (user.value.root == '2') {
      // 管理员获取所有授课信息
      response = await getAllLectures(); // 假设这个 API 返回您提供的 JSON 结构
      let lectures = response.lectures || [];
      
      // **核心：按课程号、老师号排序**
      lectures.sort((a, b) => {
        // 首先比较课程 ID
        if (a.courseID !== b.courseID) {
          return a.courseID - b.courseID;
        }
        // 如果课程 ID 相同，则比较老师 Tno
        return a.Tno - b.Tno;
      });
      
      array.value = lectures;
    } else {
      console.error(`Invalid user root: ${user.value.root}`);
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    array.value = []; // 确保出错时数组为空
  } finally {
    isLoading.value = false;
  }
};

// --- 4. 使用 watch 替代 onMounted 的主要职责 ---
// 侦听 user.root 的变化
watch(
  () => user.value.root, // 我们要侦听的目标
  (newRoot, oldRoot) => {
    // 只有当 root 值真实存在时才触发数据获取
    if (newRoot !== null && newRoot !== undefined) {
      console.log(`User root changed from ${oldRoot} to ${newRoot}. Fetching courses...`);
      fetchCourses();
    }
  },
  {
    immediate: true // <-- 这是关键！它让 watch 在组件初始化时立即执行一次处理函数
  }
);
</script>

<style scoped>
/* --- 1. 通用布局样式 (适用于所有页面) --- */
.all {
  width: 100%;
  height: 100%;
  padding: 20px;
  border: 2px solid rgb(39, 155, 194);
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
  border-bottom: 2px solid #007bff; /* 统一使用蓝色主题线 */
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

/* 新增：课程标题的样式 */
.course-title {
    font-size: 16px; /* 假设这是主要的字体大小 */
    font-weight: bold;
}

/* 新增：教师姓名的样式 */
.teacher-name {
    font-size: 13px; /* 设置一个更小的字体 */
    color: #555;     /* 使用一个柔和的颜色 */
    margin-top: 4px; /* 与课程标题之间增加一点间距 */
}
</style>