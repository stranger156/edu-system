<template>
<div class="notification-scroll-wrapper">
  <div class="notification-container">
    <button class='returnButton' @click="returnBack">返回</button>
    <div class="notification-header-card">
      <h2 class="notification-subject">{{ notification.exam_title }}</h2>
      <div class="notification-meta">
        <span class="notification-sender">作答学生ID：{{ notification.student_id }}</span>
        <span class="notification-time">学生姓名：{{ notification.student_name }}</span>
      </div>
    </div>
    <div class="notification-content-card">
      <div class="notification-content">
        <!-- 重构后的题目展示 -->
        <div v-for="type in questionTypes" :key="type">
          <div v-for="question in getQuestionsByType(type)" :key="question.number">
            <div class="question-item">
              <h3 class="question-type">{{ type }} {{ question.number }}</h3>
              
              <div class="question-section">
                <span class="section-label">题目：</span>
                <div v-html="question.content"></div>
              </div>
              
              <div class="question-section">
                <span class="section-label">标准答案：</span>
                <div v-html="question.correctAnswer"></div>
              </div>
              
              <div class="question-section">
                <span class="section-label">学生答案：</span>
                <div v-html="question.studentAnswer"></div>
              </div>
              
              <div class="question-section" v-if="question.explanation">
                <span class="section-label">解析：</span>
                <div v-html="question.explanation"></div>
              </div>
              
              <div class="question-section" v-if="question.result !== undefined">
                <span class="section-label">结果：</span>
                <div v-if="type !== '简答题'">{{ formatResult(question.result) }}</div>
                <!-- 简答题评分输入框 -->
                <div v-else class="grading-container">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="1" 
                    v-model="gradedAnswers.简答题[question.number].结果"
                    placeholder="请打出学生0-1之间的得分"
                    class="grading-input"
                    :disabled="status=='已批改'"
                  >
                  <span class="score-hint">(0-1分)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 提交批改按钮 -->
      <div class="submit-section" v-if="status!='已批改'">
        <button class="submit-button" @click="submitGrading">提交批改</button>
      </div>
    </div>
  </div>
</div>
</template>

<script  setup>
import { get_submission_details, submitCorrect } from '@/utils/api'
import { onMounted, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMathJax } from '@/utils/useMathJax';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const submissionID = route.params.submissionID;
const status = route.params.status;
const notification = ref({})
const questionTypes = ['选择题', '判断题', '简答题'];

// 存储批改结果的响应式对象
const gradedAnswers = reactive({
  选择题: {},
  判断题: {},
  简答题: {}
});

// 新增答案过滤方法
const filterAnswer = (answer) => {
  if (!answer) return '';
  // 移除 [ID:数字] 格式的内容
  return answer.replace(/\[ID:\d+\]/g, '').trim();
};

// 重构题目处理方法
const getQuestionsByType = (type) => {
  const correctAnswers = notification.value?.correct_answer?.[type] || {};
  const studentAnswers = notification.value?.student_answer?.[type] || {};
  
  // 获取所有题号并排序
  const numbers = [...new Set([
    ...Object.keys(correctAnswers),
    ...Object.keys(studentAnswers)
  ])].sort((a, b) => parseInt(a) - parseInt(b));
  
  return numbers.map(number => {
    const correct = correctAnswers[number] || {};
    const student = studentAnswers[number] || {};
    
    // 初始化批改数据
    if (!gradedAnswers[type][number]) {
      gradedAnswers[type][number] = {
        答案: student.答案 || '',
        结果: student.结果 || ''
      };
    }
    
    return {
      number,
      content: filterAnswer(correct.题目),
      correctAnswer: filterAnswer(correct.答案),
      studentAnswer: filterAnswer(student.答案),
      explanation: correct.解析,
      result: student.结果
    };
  });
};

// 格式化结果显示
const formatResult = (result) => {
  if (typeof result === 'boolean') {
    return result ? '✓ 正确' : '✗ 错误';
  }
  return result;
};

// 提交批改
const submitGrading = async () => {
  try {
    // 构造提交数据
    const payload = {
      submission_id: parseInt(submissionID),
      graded_answers: JSON.parse(JSON.stringify(gradedAnswers))
    };
    
    const response = await submitCorrect(payload);
    
    ElMessage.success('批改提交成功！')
    
    // 提交后返回上一页
    router.back();
  } catch (error) {
    ElMessage.error('提交批改失败，请重试')
  }
};

onMounted(() => {
  get_submission_details(submissionID).then(res => {
    notification.value = res.data;
    
    // 初始化批改数据
    Object.keys(gradedAnswers).forEach(type => {
      const answers = notification.value?.student_answer?.[type] || {};
      Object.keys(answers).forEach(number => {
        if (!gradedAnswers[type][number]) {
          gradedAnswers[type][number] = {
            答案: answers[number].答案,
            结果: answers[number].结果
          };
        }
      });
    });
  });
});

useMathJax(notification);

const returnBack = () => {
  router.back();
}
</script>

<style scoped>
/* 样式保持不变 */
.notification-header-card {
  background-color: #f0f8ff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  padding: 10px;
  box-sizing: border-box;
}

.notification-scroll-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.question-item {
  margin-bottom: 12px;
  page-break-inside: avoid;
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

.notification-content {
  padding-bottom: 20px;
}

.notification-content-card {
  flex: 1;
  margin-top: 16px;
  background-color: #f6f5ec;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 12px 40px;
  overflow-y: auto;
  min-height: calc(100vh - 280px);
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
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin: 8px 0;
  padding: 4px 0;
}

.notification-scroll-wrapper {
  height: 85vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

.notification-content-card {
  flex: 1;
  margin-top: 0px;
  background-color: #f6f5ec;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  overflow-y: auto;
  min-height: calc(100vh - 300px);
  max-height: calc(100vh - 300px);
}

.notification-content-card::-webkit-scrollbar {
  width: 6px;
}

.notification-content-card::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

/* 新增评分输入框样式 */
.grading-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grading-input {
  width: 180px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  width: 200px;
}

.grading-input:focus {
  outline: none;
  border-color: #009ad6;
  box-shadow: 0 0 0 2px rgba(0, 154, 214, 0.2);
}

.grading-input::placeholder {
  color: #aaa;
}

.score-hint {
  color: #666;
  font-size: 12px;
}

/* 提交按钮样式 */
.submit-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #eee;
}

.submit-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #218838;
}
</style>