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
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const array = ref<any[]>([]);
const isLoading = ref(true);

const pageTitle = computed(() => {
  switch (user.value.root) {
    case '0': return '我学的课';
    case '1': return '通知区';
    case '2': return '所有课程';
    default: return '列表';
  }
});

const emptyMessage = computed(() => {
  switch (user.value.root) {
    case '0': return '您还没有选择任何课程';
    case '1': return '您还没有收到任何通知';
    case '2': return '系统中还没有任何课程';
    default: return '暂无内容';
  }
});

onMounted(() => {
  if (!user.value.root) {
    isLoading.value = false;
    return;
  }

  let apiCall;
  let dataProcessor = (data: any) => Array.isArray(data) ? data : [];

  if (user.value.root === '0') { // --- 学生 ---
    apiCall = getCourseByStudent();
    dataProcessor = (res) => res.courses || [];
  } 
  else if (user.value.root === '1') { // --- 老师 ---
    apiCall = getAllNoticesByTeacher();
    // **老师的处理器: 将对象转换为数组**
    dataProcessor = (res) => {
      if (res && typeof res.notices === 'object' && res.notices !== null) {
        return Object.entries(res.notices).map(([id, notice]) => ({
          id: id,
          ...notice
        })).sort((a, b) => Date.parse(b.publishTime) - Date.parse(a.publishTime));
      }
      return [];
    };
  } 
  else if (user.value.root === '2') { // --- 管理员 ---
    apiCall = getAllCourses();
    dataProcessor = (res) => res.data || [];
  } 
  else {
    isLoading.value = false;
    return;
  }

  // 执行 API 调用
  apiCall.then(res => {
    array.value = dataProcessor(res);
  }).catch(error => {
    console.error("Failed to fetch data:", error);
    array.value = [];
  }).finally(() => {
    isLoading.value = false;
  });
});
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