<template>
<div class="common-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside  class="side">
        <div>
            <img src="../image/class.jpg" alt="" class="photo">
            <div style="text-align: center;color: black; margin-bottom: 30px;font-size: 20px;"> {{ name }}</div>
        </div>
<div> 
    <router-link  :to="{ name: 'Chapter' }" :class="title==='章节'?'link active':'link'" @click="title='章节'">
  <el-icon :size="20"><MessageBox /></el-icon>
 <span style="margin-left: 10px;">章节</span>
 </router-link>
  <router-link :to="{ name: 'Task' }" @click="title='任务'" :class="title==='任务'?'link active':'link'" >
    <el-icon :size="20"><Menu /></el-icon>
     <span style="margin-left: 10px;">任务</span>
  </router-link>
 <router-link :to="{ name: 'Data' }" :class="title==='资料'?'link active':'link'" @click="title='资料'">
  <el-icon :size="20"><FolderOpened /></el-icon>
   <span style="margin-left: 10px;">资料</span>
 </router-link>
  <router-link :to="{ name: 'courseMessage' }" :class="title==='通知'?'link active':'link'" @click="title='通知'">
  <el-icon :size="20"><MessageBox/></el-icon>
   <span style="margin-left: 10px;">通知</span>
 </router-link>
</div>
      </el-aside>
      <el-container>
        <el-header class="top">
          <div style="float: left;margin-top: 15px;font-size: 18px;margin-left: 570px;">
           {{name}}
          </div>
     <div style="display: flex; align-items: center; float: right; margin-top: 20px; font-size: 18px;">
     <el-icon :size="20" @click="toHome" style="cursor: pointer;"><HomeFilled /></el-icon>
    <span @click="toHome" style="margin-left: 5px;cursor: pointer;">返回首页</span>
</div>
        </el-header>
        <el-main style="background-color: #f1f5f5;">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>

</template>

<script setup>
// 组合式 API 写法（推荐）
import router from '@/router'
import { getLectureInfoByID } from '@/utils/api'
import { watch, onMounted, ref } from 'vue'
import { useRoute} from 'vue-router';
const name=ref('')
const route = useRoute();
const title=ref('')
// 定义 props（必须与路由参数名匹配）
const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true
  },
  teacherId: {
    type: String,
    default: 'general'
  }
})
const toHome=()=>{
    router.push('/Home')
}
const lecture={
    courseId:props.courseId,
    teacherId:props.teacherId
}
// 组件挂载时使用参数
onMounted(() => {
   if(route.name==='Chapter'){
title.value='章节'
 }
  if(route.name==='Task'){
title.value='任务'
 } 
 if(route.name==='Data'){
title.value='资料'
 }
  getLectureInfoByID(lecture).then(res=>{
    console.log(res)
    name.value=res.courseName
  })
//   console.log('组件挂载:', props.courseId, props.teacherId)
//   fetchResource()
})

</script>
<style scoped>
.photo{
    width: 140px;
    height: auto;
    margin-left: 30px;
    margin-top: 50px;
    border-radius: 10px;
}
.top{
  background-color: #f1f5f5;
  height:60px;
}
.side{
   width: 200px;
  height:100vh;
  color: rgb(133, 132, 132);
}

.link{
    text-decoration: none;
color: rgb(108, 107, 107);
display: flex; 
align-items: center;  
margin-top: 10px; 
padding: 10px;
padding-left: 50px;
margin-right: 10px;
margin-left: 10px;
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