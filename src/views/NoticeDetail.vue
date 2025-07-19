<template>
  <div class="notification-container">
    <div class="notification-header-card">
      <h2 class="notification-subject">{{ notification.title }}</h2>
      <div class="notification-meta">
        <span class="notification-sender">{{ notification.teacherName }}</span>
        <span class="notification-time">{{ notification.publishTime }}</span>
      </div>
      <div class="notification-recipients">
        收件课堂：{{ notification.courseName}}
      </div>
    </div>
    <div class="notification-content-card"> <!-- 新增的正文卡片，用于区分颜色 -->
      <div class="notification-content">
        {{notification.content}}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {getNoticeDetailByNoticeID} from '@/utils/api'
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const noticeID = route.params.id;

// 模拟通知数据
const notification = ref({});

onMounted(() => {
  getNoticeDetailByNoticeID(noticeID).then(res=>{
    notification.value = res.detail;
  })
});
</script>

<style scoped>
.notification-container {
  background-color: white;
  height:100%;
  padding: 20px;
}

.notification-header-card {
  background-color: #f0f8ff; /* 头部卡片背景色 */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.notification-content-card {
  margin-top:16px;
  background-color:#f6f5ec; /* 正文卡片背景色，与头部区分 */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
}

.notification-subject {
  margin-top: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.notification-sender {
  margin-top:6px;
  margin-right: 15px;
}

.notification-time {
  margin-top: 6px;
}
.notification-recipients {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px; /* 调整收件人信息的下边距 */
}

.notification-content {
  height: 360px;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}
</style>