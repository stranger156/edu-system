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
           <svg class="download-icon" t="1753191011488"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="26227" width="80" height="80"><path d="M607.839811 895.957102H214.69447A86.82497 86.82497 0 0 1 127.880338 809.070721V214.784781A86.839419 86.839419 0 0 1 214.69447 127.880338h594.28594a86.33729 86.33729 0 0 1 61.436749 25.456857c16.400473 16.400473 25.362934 38.208767 25.373771 61.411462L894.439878 607.821749v0.10476a32.031496 32.031496 0 0 0 64.059379 0.101149L959.825022 214.889542v-0.104761A150.775976 150.775976 0 0 0 808.98041 63.940169H214.69447A150.638703 150.638703 0 0 0 63.940169 214.784781v594.28594a150.638703 150.638703 0 0 0 150.757914 150.82655h393.141728a31.970084 31.970084 0 0 0 0-63.940169z" fill="" p-id="26228"></path><path d="M950.544667 905.331381l-122.071536-122.071536a192.217875 192.217875 0 1 0-45.213286 45.213286l122.071536 122.071536a31.970084 31.970084 0 0 0 45.213286-45.213286z m-278.547941-105.302594a128.028448 128.028448 0 1 1 90.531332-37.497116 127.193975 127.193975 0 0 1-90.527719 37.497116zM768.004516 352.212795c17.653989 0 31.966472-14.402794 31.970084-32.056783s-14.308871-32.074845-31.966472-32.078457L256.002709 287.911382a32.020659 32.020659 0 0 0-31.970084 32.024271c0 17.657601 14.308871 32.092907 31.966472 32.092908L768.004516 352.212795zM448.000226 544.033302a31.96286 31.96286 0 1 0 0-63.940169h-192.001129a31.937573 31.937573 0 1 0 0 63.878758l192.001129 0.061411zM256.017159 671.91364a31.959247 31.959247 0 1 0 0 63.922107l127.999549 0.018062a31.941185 31.941185 0 1 0 0-63.878757z" fill="" p-id="26229"></path></svg>
          查看批改情况
        </button>
        <span style="margin-left: 10px;">分数：{{ item.score }}</span>
      </div>
      <div class="download-container" @click.stop="correct(item)" v-if="item.status=='未批改'">
        <button class="download-button">
           <el-icon class="download-icon"><EditPen /></el-icon>
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