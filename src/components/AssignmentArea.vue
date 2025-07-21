<template>
  <div class="all">
    <!-- 标题部分 -->
    <div class="list-header">
      <div>作业区</div>
      <hr>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content">
      <div v-if="!isLoading && assignments.length > 0">
        <!-- 遍历作业列表 -->
        <div v-for="item in assignments" :key="item.exam_id" class="cla">
          <div class="assignment-item">
            
            <!-- 顶部: 练习题标题和状态 -->
            <div class="assignment-header">
              <span class="assignment-title">{{ item.exam_title }}</span>
              <!-- **核心: 动态状态显示** -->
              <span 
                class="assignment-status" 
                :class="{ 'is-ended': isEnded(item.end_time) }"
              >
                {{ isEnded(item.end_time) ? '已结束' : '进行中' }}
              </span>
            </div>
            
            <!-- 中部: 课程名和提交进度 -->
            <div class="assignment-meta">
              <span class="course-name">{{ item.course_name }}</span>
              <span class="submission-progress">
                提交进度: {{ item.submission_people }} / {{ item.class_people }}
              </span>
            </div>
            
            <!-- 底部: 时间范围 -->
            <div class="assignment-footer">
              <span>开始: {{ item.start_time }}</span>
              <span>截止: {{ item.end_time }}</span>
            </div>
            
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">正在加载作业...</div>
      <div v-else-if="assignments.length === 0" class="empty-state">
        暂无作业
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { get_all_exams_for_teacher, get_all_exams_for_teacher_by_course } from '@/utils/api'; // 假设这是获取老师作业列表的API
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/token';

const userStore = useUserStore();
const assignments = ref<any[]>([]);
const isLoading = ref(true);

// **核心: 判断作业是否已结束的辅助函数**
const isEnded = (endTime: string): boolean => {
  if (!endTime) return false;
  // 将结束时间字符串转换为 Date 对象
  const endDate = new Date(endTime);
  // 获取当前时间
  const now = new Date();
  // 如果当前时间晚于结束时间，则返回 true
  return now > endDate;
};

onMounted(() => {
  // 假设这个组件总是为老师加载，如果需要区分角色，可以添加 user.root 判断
  // 并且假设 API 返回的数据结构就是您提供的示例
  get_all_exams_for_teacher().then(res => { // 假设 courseId 是 2
    if (res.code === 200 && Array.isArray(res.data)) {
      // (可选) 可以在这里对数据进行排序，比如让未结束的排在前面
      res.data.sort((a, b) => {
        const aEnded = isEnded(a.end_time);
        const bEnded = isEnded(b.end_time);
        if (aEnded === bEnded) {
          // 如果状态相同，则按结束时间降序
          return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
        }
        // 未结束的 (false) 排在前面
        return aEnded ? 1 : -1;
      });
      assignments.value = res.data;
    }
  }).catch(error => {
    console.error("Failed to fetch assignments:", error);
  }).finally(() => {
    isLoading.value = false;
  });
});
</script>

<style scoped>
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
.loading-state, .empty-state {
  text-align: center;
  color: #888;
  margin-top: 20px;
}

.cla {
  margin-top: 5px;
  background-color: #cdeef4;
  border-radius: 5px;
  padding: 12px 15px; /* 调整内边距 */
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cla:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.assignment-item {
  display: flex;
  flex-direction: column;
  gap: 10px; 
  height: 100%;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-title {
  font-size: 1.1em;
  font-weight: bold;
  color: #005f73; 
}

.assignment-status {
  font-size: 0.9em;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #2a9d8f; 
  color: white;
}

.assignment-status.is-ended {
  background-color: #aaa; 
  color: #f0f0f0;
}

.assignment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #333;
}

.submission-progress {
  font-weight: 500;
}

.assignment-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #666;
  border-top: 1px solid #a0d8e9; 
  padding-top: 8px;
  margin-top: auto; 
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}
.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #a0d8e9;
  border-radius: 3px;
}
</style>