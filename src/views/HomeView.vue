<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside  class="side">
     <div style="margin-bottom: 20px;margin-top: 20px;margin-left: 10px;">  
  <text x="0" y="80%" font-family="EduLogoFont">EDU SYSTEM</text>
 </div>
<div> 
  <router-link to="/Home" @click="title='首页'" :class="title==='首页'?'link active':'link'" >
    <el-icon :size="20"><HomeFilled /></el-icon>
     <span style="margin-left: 10px;">首页</span>
  </router-link>
 <router-link to="/Class" :class="title==='课程'?'link active':'link'" @click="title='课程'">
  <el-icon :size="20"><List /></el-icon>
   <span style="margin-left: 10px;">课程</span>
 </router-link>
 <router-link  to="/Message" :class="title==='通知'?'link active':'link'" @click="title='通知'">
  <el-icon :size="20"><MessageBox /></el-icon>
 <span style="margin-left: 10px;">通知</span>
 </router-link>
</div>
      </el-aside>
      <el-container>
        <el-header class="top">
          <div style="float: left;margin-top: 15px;font-size: 18px;">
            {{ title }}
          </div>
     <div style="display: flex; align-items: center; float: right; margin-top: 20px; font-size: 18px;">
     <div style="margin-right: 20px;">
      {{ name }}
     </div> 
     <el-icon :size="20" @click="toLogin" style="cursor: pointer;"><SwitchButton /></el-icon>
    <span @click="toLogin" style="margin-left: 5px;cursor: pointer;">退出</span>
</div>
        </el-header>
        <el-main >
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
 import { RouterView } from 'vue-router';
import router from '@/router';
import  { onMounted, ref } from 'vue';
import { getSingleUserInfo } from '@/utils/api';
const title=ref('首页')
const name=ref('')
const toLogin=()=>{
  router.push('/')
}
onMounted(()=>{
  getSingleUserInfo().then(res=>{
    name.value=res.data.userName
  })
})
</script>
<style scoped>
.top{
  background-color: #89c6ce;
  height:60px;
}
.side{
  background-color: #2a7ee4;
  width: 150px;
  height:100vh;
  padding: 10px;
  color: white;
}

.link{
    text-decoration: none;
  color: white;
display: flex; 
align-items: center;  
margin-top: 10px; 
padding: 10px;
margin-right: 10px;
font-size: 18px;
}
.link:hover{
   background-color: #5394e3;
  border-radius: 20px;
  color: aliceblue;
}
.active{
  background-color: #5394e3;
  border-radius: 20px;
  color: aliceblue;
}
</style>