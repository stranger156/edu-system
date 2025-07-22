<template>
  <div class="notification-list">
    <button class='returnButton' @click="returnBack">返回</button>
    <div v-if="!notices || notices.length === 0">暂无学生选择此课堂</div>

     <div style="padding: 10px;font-size: 25px;">作业状态</div>
    <hr>
    <div v-for="(item,index) in notices" :key="index" class="notification-item">
      <img src="../image//homework.png" alt="作业图标" class="notification-icon" />
      <div class="notification-content">
        <div class="notification-title">{{ item.student_name }}</div>
        <div class="notification-sender">学生ID：{{ item.student_id }}&nbsp;&nbsp;&nbsp;&nbsp;状态：{{ item.status }}</div>
      </div>
      <div class="download-container" @click.stop="correct(item)" v-if="item.status=='已批改'">
        <button class="download-button">
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          查看批改情况
        </button>
        <span>分数：{{ item.score }}</span>
      </div>
      <div class="download-container" @click.stop="correct(item)" v-if="item.status=='未批改'">
        <button class="download-button">
          <svg class="download-icon" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          批改
        </button>
      </div>
    </div>
  </div>
</template>

<script  setup>
import { get_exam_submissions} from '@/utils/api';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
const router=useRouter()
const route=useRoute()

// 模拟从API获取的通知数据
const notices = ref([]);
const examID = route.params.id;
const state = ref('');

const correct = (notice) => {
   router.push({ name: 'correctDetail', params: { submissionID:notice.submission_id,status: notice.status} });
};

onMounted(() => {
    get_exam_submissions(examID).then(res => {
      console.log(res)
      notices.value = res.data
      for(let i = 0;i < notices.value.length;i++){
        if(notices.value[i].submission_id && notices.value[i].submission_id >= 0){
          console.log(notices.value[i].submission_id)
          console.log(notices.value[i].score)
          if(notices.value[i].score < 0)
          notices.value[i].status = '未批改'
          else
          notices.value[i].status = '已批改'
        }else notices.value[i].status = '未提交'
      }
    })
});
const returnBack = () => {
  router.back();
}
</script>

<style scoped>
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

.download-container {
  padding: 8px 15px;
  display: flex;
  align-items: center;
}

.download-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border: 0px solid white;
  border-radius: 4px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}

.download-button:hover {
  background-color: #f0f0f0;
}
.download-icon {
  align-items: center;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  fill: currentColor;
}

.notification-time-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: 12px;
}
 
/* 调整时间元素样式 */
.notification-time {
  color: #888;
  font-size: 0.9em;
  line-height: 1.4;
  white-space: nowrap;
}

.notification-list {
  padding: 20px;
  width: 100%;
  position: relative;
}
 
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  margin: 5px;
}
 
.notification-item:hover {
  background-color: #f0f0f0;
}
 
.notification-icon {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 5px;
}
.notification-content {
  flex: 1;
}
 
.notification-title {
  font-weight: bold;
  margin-bottom: 4px;
}
 
.notification-sender,
.notification-time {
  color: #888;
  font-size: 0.9em;
  margin-bottom: 2px;
}

.notification-time {
  color: #888;
  font-size: 0.9em;
  margin-left: auto;
  align-self: top;
}

.publishButton{
  background-color:#009ad6;
  color:white;
  border-color: #009ad6;
  width:96px;
  height:42px;
  border-radius: 12px;
  font-size: 15px;
  margin-bottom: 6px;
  cursor:pointer;
}

.publishButton:hover {
  background-color: #228fbd;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 800px;
  height: 600px;
  max-width: 90%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  height: 34px;
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.form-group textarea {
  height: 350px;
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.cancel-button {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-button {
  background-color: #009ad6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e05c5c;
}

.confirm-button:hover {
  background-color: #228fbd;
}
</style>