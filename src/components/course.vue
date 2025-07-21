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

<script  setup >
import { getAllCourses, getCourseByStudent, getTeacherLectures } from '@/utils/api';
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia'; // 导入 storeToRefs 以保持响应性

// --- 1. 初始化 Store 和响应式数据 ---

// a. 获取 user store 的实例
const userStore = useUserStore();

// b. **关键**: 使用 storeToRefs 来获取响应式的 state
//    这样，当 store 中的 user.root 变化时，我们的组件也能感知到。
const { user } = storeToRefs(userStore);
const isLoading = ref(true); // 新增一个加载状态
const array=ref([])

const pageTitle = computed(() => {
  switch (user.value.root) {
    case '0': return '我学的课';
    case '1': return '我教的课';
    case '2': return '所有课程';
    default: return '课程列表';
  }
});

const emptyMessage = computed(() => {
  switch (user.value.root) {
    case '0': return '您还没有选择任何课程';
    case '1': return '您还没有创建任何课程';
    case '2': return '系统中还没有任何课程';
    default: return '暂无课程';
  }
});

onMounted(() => {
  // 确保 user.root 有值
  if (!user.value.root) {
    console.warn("User root is not available on mount. Cannot fetch courses.");
    isLoading.value = false;
    return;
  }

  let apiCall;

  // 根据响应式的 user.value.root 来决定调用哪个 API
  if (user.value.root === '0') {
    apiCall = getCourseByStudent();
  } else if (user.value.root === '1') {
    // 假设 getStudentLectures 是获取老师所教课程的接口
    apiCall = getTeacherLectures();
  } else if (user.value.root === '2') {
    apiCall = getAllCourses();
  } else {
    // 如果 root 值无效，直接结束
    console.error(`Invalid user root: ${user.value.root}`);
    isLoading.value = false;
    return;
  }

  // 执行 API 调用
  apiCall.then(res => {
    // 统一处理可能的数据结构差异
    const coursesList = res.data || res.courses || res.lectures ||[];
    console.log(coursesList)
    if (Array.isArray(coursesList)) {
      array.value = coursesList;
    } else {
      console.warn("API response `data` or `courses` is not an array:", res);
    }
  }).catch(error => {
    console.error("Failed to fetch courses:", error);
    array.value = []; // 出错时清空数组
  }).finally(() => {
    isLoading.value = false; // 结束加载状态
  });
});
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