<template>
  <div style="padding: 10px;" >
    <div class="notification-content-card">
      <div style="text-align: center; font-size: 30px; padding: 20px;">{{ title }}</div>
      <div style="text-align: center;">
        <span style="margin-right: 100px; color: dimgray;">开始时间：{{ start }}</span>
        <span style="margin-left: 100px; color: dimgray;">截止时间：{{ end }}</span>
      </div>
      
    
        <div v-for="type in questionTypes" :key="type" style="margin: 30px;">
            <h3 v-if="getQuestionsByType(type).length">{{ type }}</h3>
          <div v-for="(question, index) in getQuestionsByType(type)" :key="index">
            <div class="question-item">
              <div class="question-section" style="padding-left: 20px;">
                <span class="section-label">第{{ index+1 }}题：</span>
                 <span>   {{ question.题目 }}</span>
                 <div style="margin-top: 15px;"> 
                    <el-radio-group v-if="type==='选择题'"  v-model="select[index+1].答案" >
                        <el-radio :value="'A'"  size="large" > A</el-radio>
                        <el-radio :value="'B'" size="large"> B</el-radio>
                        <el-radio :value="'C'" size="large"> C</el-radio>
                        <el-radio :value="'D'" size="large"> D</el-radio>
                    </el-radio-group>
                      <el-radio-group v-if="type==='判断题'"  v-model="judge[index+1].答案" >
                        <el-radio :value="'对'"  size="large" > 对</el-radio>
                        <el-radio :value="'错'" size="large"> 错</el-radio>
                    </el-radio-group>
                      <el-input v-if="type==='简答题'"
                            v-model="other[index+1].答案"
                            style="width: 1000px"
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            type="textarea"
                            placeholder="请作答！"
                        />
                 </div>
              </div>
            </div>
          </div>
        </div>
        <div style="text-align: center;">
         <el-button type="primary" @click="submit">交卷</el-button>
        </div>
    </div>


</div>
</template>

<script setup>
import { getTest, submitExamine } from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMathJax } from '@/utils/useMathJax';
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router';
const title = ref('');
const route = useRoute();
const start = ref('');
const end = ref('');
const select = ref({});
const judge=ref({})
const other=ref({})
const exam_id = route.params.id;
const answer=ref({
    exam_id:exam_id,
    exam_answer:{
        选择题:select.value,
        判断题:judge.value,
        简答题:other.value
    }
})

// 新增题型顺序定义
const questionTypes = ['选择题', '判断题', '简答题'];

// 新增题目处理方法
const getQuestionsByType = (type) => {
    let content = {}
    content = notification.value?.exam_content || {};
  const questions = content[type] || {};
  
  return Object.entries(questions)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([_, q],index) => ({
      ...q,
      // 新增过滤逻辑：移除所有 [ID:数字] 格式的内容
      序号:index+1,
      题目: q.题目?.replace(/\[ID:\d+\]/g, '')?.trim(),
    }));
};

const submit=()=>{
     ElMessageBox.alert('您只有一次提交机会，请确认交卷', {
    confirmButtonText: '提交',
    callback: (action) => {
        if(action==='confirm'){
            console.log(answer.value)
            submitExamine(answer.value).then(res=>{
                if(res.code===200){
             ElMessage({
                type: 'sucess',
                message: res.message,
                })
                setTimeout(()=>{
                    router.back()
                },1000)
                }
                  
            })
        }
        
    },
  })
}
// 模拟通知数据
const notification = ref({});

onMounted(async () => {
    const res = await getTest(exam_id);
    notification.value=res.data
    title.value = res.data.exam_title;
    start.value = res.data.start_time;
    end.value = res.data.end_time;
    useMathJax(notification.value)
    for(let i=1;i<= getQuestionsByType('选择题').length;i++){
        select.value[i]={
            答案:null
        }
    }
    for(let i=1;i<=getQuestionsByType('判断题').length;i++){
        judge.value[i]={
            答案:null
        }
    }
      for(let i=1;i<=getQuestionsByType('简答题').length;i++){
        other.value[i]={
            答案:null
        }
    }

});
</script>
<style scoped>


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
  padding: 12px;
  overflow-y: auto;
  min-height: calc(100vh - 100px); /* 调整高度计算 */
  max-height: calc(100vh - 100px); /* 新增最大高度限制 */
}
 
.notification-content-card {
  flex: 1;
  padding: 12px 12px 40px; /* 底部增加40px内边距 */
  overflow-y: auto;
}
/* 优化滚动条样式 */
.notification-content-card::-webkit-scrollbar {
display: none;
}
 
.notification-content-card::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}
</style>