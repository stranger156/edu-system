<template>
  <div class="all">
    <!-- 标题部分 -->
    <div class="list-header">
      <div>我的作业</div>
      <hr>
    </div>
    
    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content">
      <!-- 成功加载且有数据时 -->
      <div v-if="!isLoading && assignments.length > 0">
        <!-- 遍历作业列表 -->
        <div v-for="item in assignments" :key="item.exam_id" class="cla">
          <div class="assignment-item">
            
            <!-- 顶部: 练习题标题和课程名 -->
            <div class="assignment-header">
              <span class="assignment-title">{{ item.exam_title }}</span>
              <span class="course-name">{{ item.course_name }}</span>
            </div>
            
            <!-- 中部: 完成状态 -->
            <div class="assignment-meta">
              <span class="status-label">状态:</span>
              <!-- **核心: 根据学生的 status 动态显示** -->
              <span 
                class="assignment-status" 
                :class="{
                  'status-completed': item.status === '已完成',
                  'status-pending': item.status === '未完成' && !isEnded(item['结束时间']),
                  'status-missed': item.status === '未完成' && isEnded(item['结束时间'])
                }"
              >
                {{ getDisplayStatus(item) }}
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
      
      <!-- 加载和空状态 -->
      <div v-if="isLoading" class="loading-state">正在加载作业...</div>
      <div v-else-if="assignments.length === 0" class="empty-state">
        恭喜，暂无待完成的作业！
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getExam } from '@/utils/api'; // 1. **修改**: 引入学生获取作业的 API
import { onMounted, ref } from 'vue';

const assignments = ref<any[]>([]);
const isLoading = ref(true);

// 辅助函数：判断作业是否已过截止日期
const isEnded = (endTime: string): boolean => {
  if (!endTime) return false;
  return new Date() > new Date(endTime);
};

// 辅助函数：根据后端 status 和截止时间，生成更丰富的显示状态
const getDisplayStatus = (item: any): string => {
  if (item.status === '已完成') {
    return '已完成';
  }
  if (item.status === '未完成') {
    return isEnded(item['结束时间']) ? '已错过' : '待完成';
  }
  return item.status; // 默认情况
};

onMounted(() => {
  // 2. **修改**: 调用学生获取作业的 API
  getExam().then(res => {
    if (res.code === 200 && Array.isArray(res.data)) {
      // 3. **修改**: 对返回的数据进行排序
      res.data.sort((a, b) => {
        const aStatus = getDisplayStatus(a);
        const bStatus = getDisplayStatus(b);
        
        // 优先级: 待完成 > 已完成 > 已错过
        const statusPriority = { '待完成': 3, '已完成': 2, '已错过': 1 };
        
        if (statusPriority[aStatus] !== statusPriority[bStatus]) {
          return statusPriority[bStatus] - statusPriority[aStatus];
        }
        
        // 如果状态相同，则按结束时间升序排列（越早截止的越靠前）
        return new Date(a['结束时间']).getTime() - new Date(b['结束时间']).getTime();
      });
      assignments.value = res.data;
    }
  }).catch(error => {
    console.error("Failed to fetch student assignments:", error);
  }).finally(() => {
    isLoading.value = false;
  });
});
</script>

<style scoped>
/* --- 基础布局和容器样式 --- */
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
  border-bottom: 2px solid #007bff;
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

/* --- 作业卡片样式 --- */
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

.assignment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #005f73;
}

.course-name {
  font-size: 0.9em;
  color: #fff;
  background-color: #5a67d8;
  padding: 3px 10px;
  border-radius: 12px;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
    font-size: 1em;
    color: #555;
}

.assignment-status {
  font-size: 0.95em;
  padding: 4px 12px;
  border-radius: 15px;
  color: white;
  font-weight: 500;
}

/* --- 动态状态颜色 --- */
.status-completed {
  background-color: #28a745; /* 已完成 - 绿色 */
}
.status-pending {
  background-color: #ffc107; /* 待完成 - 黄色 */
  color: #333;
}
.status-missed {
  background-color: #dc3545; /* 已错过 - 红色 */
}

.assignment-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #666;
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}
</style>