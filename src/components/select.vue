<template>
  <div class="list-wrapper">
    <div class="all">
      <div class="list-header">
        <div>{{ pageTitle }}</div>
        <hr>
      </div>
      
      <div class="scrollable-content">
        <div v-if="!isLoading && array.length > 0">
          <div v-for="(item, index) in array" :key="item.id || index" class="cla">
            <div v-if="user.root === '0'">...</div>
            <div v-else-if="user.root === '1'" class="teacher-item">
              <div class="notice-header">
                <span class="notice-title">{{ item.title }}</span>
                <span class="notice-course">{{ item.courseName }}</span>
              </div>
              <div class="notice-content">{{ item.content }}</div>
            </div>
            <div v-else-if="user.root === '2'">...</div>
          </div>
        </div>
        
        <div v-if="isLoading" class="loading-state">正在加载...</div>
        <div v-else-if="array.length === 0" class="empty-state">
          {{ emptyMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getAllCourses, getCourseByStudent, getAllNoticesByTeacher } from '@/utils/api';
import { ref, computed, watch } from 'vue'; // 1. 引入 watch
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

// --- 1. 定义数据类型 (提升类型安全) ---
interface Course {
  courseID: number;
  courseName: string;
  // ...可以根据实际情况补充其他课程属性
}

interface Notice {
  id: string;
  title: string;
  content: string;
  courseName: string;
  publishTime: string; // 假设这是一个日期字符串
}

// --- 2. 初始化 Store 和响应式数据 ---
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// 为 array 提供更精确的类型
const array = ref<(Course | Notice)[]>([]); 
const isLoading = ref(true);

// --- 3. 计算属性 (无需修改，但使用宽松比较更安全) ---
const pageTitle = computed(() => {
  switch (String(user.value.root)) {
    case '0': return '我学的课';
    case '1': return '通知区';
    case '2': return '所有课程';
    default: return '列表';
  }
});

const emptyMessage = computed(() => {
  switch (String(user.value.root)) {
    case '0': return '您还没有选择任何课程';
    case '1': return '您还没有收到任何通知';
    case '2': return '系统中还没有任何课程';
    default: return '暂无内容';
  }
});

// --- 4. 集中化的权限策略 (提升代码结构) ---
// 将每个角色的数据获取逻辑配置化，便于维护和扩展
const roleStrategies = {
  '0': { // 学生
    apiCall: getCourseByStudent,
    dataProcessor: (res: any): Course[] => res?.courses || []
  },
  '1': { // 教师
    apiCall: getAllNoticesByTeacher,
    dataProcessor: (res: any): Notice[] => {
      // 健壮地处理对象到数组的转换
      if (res && typeof res.notices === 'object' && res.notices !== null) {
        return Object.entries(res.notices).map(([id, notice]: [string, any]) => ({
          id: id,
          ...notice
        })).sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()); // 按时间降序排序
      }
      return [];
    }
  },
  '2': { // 管理员
    apiCall: getAllCourses,
    dataProcessor: (res: any): Course[] => res?.data || []
  }
};

// --- 5. 封装的异步获取函数 ---
const fetchDataForRole = async (role: string | number | null) => {
  const roleKey = String(role);
  const strategy = roleStrategies[roleKey];

  if (!strategy) {
    console.warn(`No data fetching strategy found for role: ${roleKey}`);
    array.value = [];
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  try {
    const response = await strategy.apiCall();
    array.value = strategy.dataProcessor(response);
  } catch (error) {
    console.error(`Failed to fetch data for role ${roleKey}:`, error);
    array.value = []; // 出错时清空数组
  } finally {
    isLoading.value = false;
  }
};

// --- 6. 使用 watch 替代 onMounted (提升响应性) ---
watch(
  () => user.value.root,
  (newRoot) => {
    if (newRoot !== null && newRoot !== undefined) {
      fetchDataForRole(newRoot);
    } else {
      // 如果用户登出，root 变为 null，则清空列表
      isLoading.value = false;
      array.value = [];
    }
  },
  {
    immediate: true // 关键：在组件初始化时立即执行一次，完美替代 onMounted
  }
);
</script>

<style scoped>

.list-wrapper {
  width: 100%;
  height: 100%; 
}

.all {
  width: 100%;
  height: 100%;
  padding: 10px;
  border: 2px solid rgb(39, 155, 194);
  border-radius: 5px;
  box-sizing: border-box; 

  display: flex;
  flex-direction: column;
}

.list-header {
  flex-shrink: 0;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 5px; 
  min-height: 0;
}


.cla {
  margin-top: 5px;
  background-color: #cdeef4;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
}
.loading-state, .empty-state {
  text-align: center;
  color: #888;
  margin-top: 20px;
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
</style>