<template>
  <div class="notification-list">
    <div v-if="!notices || notices.length === 0">暂无通知</div>
    <button class='publishButton' v-if="state=='1'" @click="showPublishDialog = true">发布通知</button>
    <div v-for="(item, index) in notices" :key="index" class="notification-item" @click="viewDetails(item)">
      <img src="../image//notice.png" alt="通知图标" class="notification-icon" />
      <div class="notification-content">
        <div class="notification-title">{{ item.title }}</div>
        <div class="notification-sender" v-if="state=='0'">发件人：{{ item.teacherName }}</div>
        <div class="notification-sender" v-if="state=='1'">教学课堂：{{ item.courseName }}</div>
      </div>
      <div class="notification-time">{{ item.publishTime }}</div>
    </div>

    <!-- 发布通知弹窗 -->
    <div v-if="showPublishDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>发布新通知</h3>
        <div class="form-group">
          <label for="notice-title">通知标题</label>
          <input id="notice-title" v-model="newNotice.title" type="text" placeholder="请输入通知标题" />
        </div>
        <div class="form-group">
          <label for="notice-content">通知内容</label>
          <textarea id="notice-content" v-model="newNotice.content" placeholder="请输入通知内容" rows="5"></textarea>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="showPublishDialog = false">取消</button>
          <button class="confirm-button" @click="publish_notice">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getLectureNoticeByStudent, getLectureNoticeByTeacher, publishNotice } from '@/utils/api';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

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
const showPublishDialog = ref(false);
const newNotice = ref({
  title: '',
  content: '',
  courseId: props.courseId
});

const lecture = {
  courseId: props.courseId,
  teacherId: props.teacherId
}

// 查看详情函数
const viewDetails = (notice) => {
  console.log('跳转到详情页面，通知内容:', notice);
};

// 发布通知
const publish_notice = async() => {
  if (!newNotice.value.title.trim()) {
    ElMessage.warning('请输入通知标题');
    return;
  }
  if (!newNotice.value.content.trim()) {
    ElMessage.warning('请输入通知内容');
    return;
  }

  try {
    const response = await publishNotice({
      title: newNotice.value.title,
      content: newNotice.value.content,
      courseId: newNotice.value.courseId
    });
    
    if (response.code == 200) {
      ElMessage.success('通知发布成功');
      showPublishDialog.value = false;
      // 重置表单
      newNotice.value = {
        title: '',
        content: '',
        courseId: props.courseId
      };
      // 刷新通知列表
      refreshNotices();
    } else {
      ElMessage.error(response.message || '通知发布失败');
    }
  } catch (error) {
    ElMessage.error('通知发布失败，请稍后重试');
    console.error('发布通知失败:', error);
  }
};

// 刷新通知列表
const refreshNotices = () => {
  if (state.value == '0') {
    getLectureNoticeByStudent(lecture).then(res => {
      notices.value = res.notices;
    });
  } else if (state.value == '1') {
    getLectureNoticeByTeacher(lecture.courseId).then(res => {
      notices.value = res.notices;
    });
  }
};

onMounted(() => {
  state.value = localStorage.getItem('root');
  refreshNotices();
});
</script>

<style scoped>
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