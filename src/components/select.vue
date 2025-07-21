<template>
  <div class="list-wrapper">
    <div class="all">
      <div class="list-header">
        <!-- 标题会自动根据用户角色变化 -->
        <div>{{ pageTitle }}</div>
        <hr>
      </div>
      
      <!-- 滚动内容区 -->
      <div class="scrollable-content">
        <!-- 加载中的状态 -->
        <div v-if="isLoading" class="loading-state">
          正在加载...
        </div>
        
        <!-- 加载完成但无数据的状态 -->
        <div v-else-if="array.length === 0" class="empty-state">
          {{ emptyMessage }}
        </div>
        
        <!-- 成功加载且有数据时，显示列表 -->
        <div v-else>
          <!-- 使用 v-for 循环渲染数组中的每一项 -->
          <!-- 注意：我们现在在循环外部处理权限，内部直接渲染 -->
          <div v-for="item in array" :key="item.id" class="cla">

            <!-- 模板 A: 用于显示通知 (学生或教师视图) -->
            <!-- 我们使用 'title' in item 来判断当前项是否为通知 -->
            <div v-if="'title' in item" class="notice-item">
              <div class="notice-header">
                <span class="notice-title">{{ item.title }}</span>
                <span class="notice-course">来自: {{ item.courseName }}</span>
              </div>
              <div class="notice-content">{{ item.content }}</div>
              <div class="notice-footer">
                <span class="teacher-info">发布人: {{ item.teacherName }}</span>
                <span class="publish-time">{{ item.publishTime }}</span>
              </div>
            </div>

            <!-- 模板 B: 用于显示课程 (管理员视图) -->
            <!-- 使用 'courseName' in item 且没有 'title' 来判断 -->
            <div v-else-if="'courseName' in item" class="course-item">
              {{ item.courseName }}
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getAllCourses, getAllNoticesByStudent, getAllNoticesByTeacher } from '@/utils/api';
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
    case '0': return '通知区';
    case '1': return '通知区';
    case '2': return '所有课程';
    default: return '列表';
  }
});

const emptyMessage = computed(() => {
  switch (String(user.value.root)) {
    case '0': return '您还没有收到任何通知';
    case '1': return '您还没有收到任何通知';
    case '2': return '系统中还没有任何课程';
    default: return '暂无内容';
  }
});

// --- 4. 集中化的权限策略 (提升代码结构) ---
// 将每个角色的数据获取逻辑配置化，便于维护和扩展
const roleStrategies = {
  '0': { // 学生
    apiCall: getAllNoticesByStudent,
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