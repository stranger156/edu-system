<template>
  <div class="all">
    <!-- 1. 标题现在直接依赖于计算属性，自动变化 -->
    <div>{{ pageTitle }}</div>
    
    <hr>
    
    <!-- 课程列表，当 array 有数据时才显示 -->
    <div v-if="!isLoading && array.length > 0">
      <div v-for="course in array" :key="course.courseID" class="cla">
        <!-- 假设每个课程对象都有 courseID 和 courseName -->
        {{ course.courseName }}
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div v-if="isLoading" class="loading-state">正在加载课程...</div>
    
    <!-- 加载完成但无数据状态 -->
    <div v-else-if="array.length === 0" class="empty-state">
      {{ emptyMessage }}
    </div>
  </div>
</template>

<script setup>
import { getAllCourses, getCourseByStudent, getTeacherLectures } from '@/utils/api';
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
const fetchCourses = () => {
  // 如果 root 值不存在，则不执行任何操作
  if (user.value.root === null || user.value.root === undefined) {
    return;
  }
  
  isLoading.value = true;
  array.value = []; // 在请求前清空旧数据

  let apiCall;

  // 根据 root 值决定调用哪个 API
  if (user.value.root == '0') {
    apiCall = getCourseByStudent();
  } else if (user.value.root == '1') {
    apiCall = getTeacherLectures();
  } else if (user.value.root == '2') {
    apiCall = getAllCourses();
  } else {
    console.error(`Invalid user root: ${user.value.root}`);
    isLoading.value = false;
    return;
  }

  // 执行 API 调用
  apiCall.then(res => {
    const coursesList = res.data || res.courses || res.lectures || [];
    if (Array.isArray(coursesList)) {
      array.value = coursesList;
    } else {
      console.warn("API response is not an array:", res);
    }
  }).catch(error => {
    console.error("Failed to fetch courses:", error);
  }).finally(() => {
    isLoading.value = false;
  });
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
.all{
     width: 100%;
    height: 100%;
    padding: 10px;
    border: 2px solid rgb(39, 155, 194); /* 增加了'solid'样式 */
    border-radius: 5px;
}
.cla{
    margin-top: 5px;
    background-color: #cdeef4;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
}
</style>