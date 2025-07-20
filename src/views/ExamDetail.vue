<template>
<div class="notification-scroll-wrapper">
  <div class="notification-container">
    <button class='returnButton' @click="returnBack">返回</button>
    <div class="notification-header-card">
      <h2 class="notification-subject">{{ notification.exam_title }}</h2>
      <div class="notification-meta">
        <span class="notification-sender">发布时间：{{ notification.start_time }}</span>
        <span class="notification-time">截止时间：{{ notification.end_time }}</span>
      </div>
      <div class="notification-recipients" v-if="state != '0'">
        提交人数：{{ notification.submission_count }}/{{ notification.total_students }}
      </div>
    </div>
    <div class="notification-content-card">
      <div class="notification-content">
        <!-- 新增的结构化展示 -->
        <div v-for="type in questionTypes" :key="type">
          <div v-for="(question, index) in getQuestionsByType(type)" :key="index">
            <div class="question-item">
              <h3 class="question-type">{{ type }} {{ index + 1 }}</h3>
              <div class="question-section">
                <span class="section-label">题目：</span>
                {{ question.题目 }}
              </div>
              <div class="question-section" v-if="state!='0'">
                <span class="section-label">答案：</span>
                {{ question.答案 }}
              </div>
              <div class="question-section" v-if="state!='0'">
                <span class="section-label">解析：</span>
                {{ question.解析 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script lang="ts" setup>
import { get_all_exams_for_teacher_by_exam, get_exam_for_student } from '@/utils/api'
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {marked} from 'marked';

const route = useRoute();
const router = useRouter();
const noticeID = route.params.id;
const state = ref('')

// 新增题型顺序定义
const questionTypes = ['选择题', '判断题', '简答题'];

// 新增题目处理方法
const getQuestionsByType = (type: string) => {
    let content = {}
  if(state.value == '0'){
    content = notification.value?.exam_content || {};
  }else{
    content = notification.value?.content || {};
  }
  const questions = content[type] || {};
  
  return Object.entries(questions)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([_, q]) => ({
      ...q,
      // 新增过滤逻辑：移除所有 [ID:数字] 格式的内容
      题目: q.题目?.replace(/\[ID:\d+\]/g, '')?.trim(),
      答案: q.答案?.replace(/\[ID:\d+\]/g, '')?.trim(),
      解析: q.解析?.replace(/\[ID:\d+\]/g, '')?.trim()
    }));
};

// 模拟通知数据
const notification = ref<any>({});

onMounted(() => {
    state.value = localStorage.getItem('root');
    if(state.value == '0'){
        get_exam_for_student(noticeID).then(res => {
            notification.value = res.data;
        })
    }else{
        get_all_exams_for_teacher_by_exam(noticeID).then(res => {
            notification.value = res.data[0];
        })
    }
    
});

const returnBack = () => {
  router.back();
}
</script>

<style scoped>
.notification-header-card {
  background-color: #f0f8ff; /* 头部卡片背景色 */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.notification-scroll-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 优化题目项间距 */
.question-item {
  margin-bottom: 12px;
  page-break-inside: avoid; /* 防止题目被分页截断 */
}

.question-type {
  color: #2c3e50;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #009ad6;
}

.question-section {
  margin: 8px 0;
  line-height: 1.6;
}

.section-label {
  font-weight: 600;
  color: #009ad6;
}

/* 原有样式保持不变 */
.returnButton {
  background-color: #009ad6;
  color: white;
  border-color: #009ad6;
  width: 96px;
  min-height: 42px;
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 6px;
  cursor: pointer;
}

.notification-container {
  background-color: white;
  height: 100%;
  padding: 10px;
}

.notification-container {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
 
/* 新增底部安全间距 */
.notification-content {
  padding-bottom: 20px;
}

.notification-content-card {
  flex: 1;
  margin-top: 16px;
  background-color: #f6f5ec;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 12px 40px; /* 底部增加40px内边距 */
  overflow-y: auto;
  min-height: calc(100vh - 280px); /* 最小高度保障 */
}

.notification-subject {
  margin-top: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
}

.notification-sender {
  margin-top: 6px;
  margin-right: 15px;
}

.notification-time {
  margin-top: 6px;
}

.notification-recipients {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px;
}
.question-section {
  white-space: pre-wrap;  /* 保留换行符并自动换行 */
  word-break: break-word; /* 允许长单词换行 */
  line-height: 1.6;
  margin: 8px 0;
  padding: 4px 0;
}
 
/* 优化滚动容器高度计算 */
.notification-scroll-wrapper {
  height: 85vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px; /* 新增底部安全间距 */
}
 
.notification-content-card {
  flex: 1;
  margin-top: 0px;
  background-color: #f6f5ec;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  overflow-y: auto;
  min-height: calc(100vh - 300px); /* 调整高度计算 */
  max-height: calc(100vh - 300px); /* 新增最大高度限制 */
}
 
/* 优化滚动条样式 */
.notification-content-card::-webkit-scrollbar {
  width: 6px;
}
 
.notification-content-card::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}
</style>