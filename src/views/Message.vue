<template>
  <div class="notification-list">
    <div v-show="!notices">暂无通知</div>
    <div v-for="(item, index) in notices" :key="index" class="notification-item" @click="viewDetails(index)">
      <img src="../image//notice.png" alt="通知图标" class="notification-icon" />
      <div class="notification-content">
        <div class="notification-title">{{ item.title }}</div>
        <div class="notification-sender" v-if="state=='0'">发件人：{{ item.teacherName }}</div>
        <div class="notification-sender" v-if="state=='1'">教学课堂：{{ item.courseName }}</div>
      </div>
      <div class="notification-time">{{ item.publishTime }}</div>
    </div>
  </div>
</template>

<script  setup>
import { getAllNoticesByStudent, getAllNoticesByTeacher} from '@/utils/api';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router=useRouter()
// 模拟从API获取的通知数据
const notices = ref({});
const state = ref('')
// 查看详情函数
const viewDetails = (notice) => {
  // 跳转到新的页面，传递通知详情（这里简单用console.log模拟）
  console.log('跳转到详情页面，通知内容:', notice);
  // 实际项目中可以使用vue-router进行页面跳转，例如：
  router.push({ name: 'noticeDetail', params: { id:notice } });
};

onMounted(()=>{
    state.value = localStorage.getItem('root')
    if(state.value == '0'){
        getAllNoticesByStudent().then(res=>{
            notices.value=res.notices
        })
    }else if(state.value == '1'){
        getAllNoticesByTeacher().then(res=>{
            notices.value=res.notices
        })
    }
})
</script>

<style scoped>
.notification-list {
  width: 100%;
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
  margin-left: auto; /* 关键样式：将时间推到最右侧 */
  align-self: top; /* 垂直居中 */
}
</style>