<template>
<div class="common-layout" style="background-color: #f2f5f5;">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside  class="side">
        <div>
            <img src="../image/class.jpg" alt="" class="photo">
            <div style="text-align: center;color: black; margin-bottom: 30px;font-size: 20px;"> {{ name }}</div>
        </div>
<div> 
    <router-link  :to="{ name: 'Chapter' }" :class="title==='Chapter'?'link active':'link'" @click="title='Chapter'">
  <el-icon :size="20"><MessageBox /></el-icon>
 <span style="margin-left: 10px;">章节</span>
 </router-link>
  <router-link :to="{ name: 'Task' }" @click="title='Task'" :class="title==='Task'?'link active':'link'" >
    <el-icon :size="20"><Menu /></el-icon>
     <span style="margin-left: 10px;">任务</span>
  </router-link>
 <router-link :to="{ name: 'Data' }" :class="title==='Data'?'link active':'link'" @click="title='Data'">
  <el-icon :size="20"><FolderOpened /></el-icon>
   <span style="margin-left: 10px;">资料</span>
 </router-link>
  <router-link :to="{ name: 'courseMessage' }" :class="title==='courseMessage'?'link active':'link'" @click="title='courseMessage'">
  <el-icon :size="20"><MessageBox/></el-icon>
   <span style="margin-left: 10px;">通知</span>
 </router-link>
   <router-link :to="{ name: 'student' }" :class="title==='student'?'link active':'link'" @click="title='student'">
  <el-icon :size="20"><MessageBox/></el-icon>
   <span style="margin-left: 10px;">学生详情</span>
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
        <el-main style="background-color: white;margin-left: 50px;margin-right: 50px;margin-bottom: 50px;">
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
  title.value=route.name
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
    margin-top: 80px;
    border-radius: 10px;
}
.top{
  background-color: #f2f5f5;
  height:80px;
}
.side{
  background-color: #fff;
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
padding-left: 30px;
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