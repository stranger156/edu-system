<template>
  <div class="notification-list">
    <div v-if="!notices || notices.length === 0">暂无作业</div>
    <div v-for="item in notices" :key="index" class="notification-item" @click="viewDetails(item.exam_id)">
      <img src="../image//homework.png" alt="作业图标" class="notification-icon" />
      <div class="notification-content">
        <div class="notification-title">{{ item.exam_title }}</div>
        <div class="notification-sender">提交人数：{{ item.submission_count}} / {{ item.total_students }}</div>
      </div>
      <div class="notification-time-container">
        <div class="notification-time">开始时间：{{ item.start_time }}</div>
        <div class="notification-time">截止时间：{{ item.end_time }}</div>
      </div>
    </div>
  </div>
</template>

<script  setup>
import { get_all_exams_for_teacher_by_course} from '@/utils/api';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router=useRouter()
const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true
  },
  teacherId: {
    type: [String, Number],
    required: true
  }
})

// 模拟从API获取的通知数据
const notices = ref([]);
const state = ref('');

const lecture = {
  courseId: props.courseId,
  teacherId: props.teacherId
}

// 查看详情函数
const viewDetails = (notice) => {
   router.push({ name: 'examDetail', params: { id:notice } });
};

onMounted(() => {
  get_all_exams_for_teacher_by_course(lecture.courseId).then(res => {
    notices.value = res.data
  })
});
</script>

<style scoped>
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
  width: 100%;
  position: relative;
}
 
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
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