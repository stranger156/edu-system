<template>
<div class="common-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside  class="side">
<div> 
    <router-link  :to="{ name: 'Chapter' }" :class="title==='章节'?'link active':'link'" @click="title='章节'">
  <el-icon :size="20"><MessageBox /></el-icon>
 <span style="margin-left: 10px;">章节</span>
 </router-link>
  <router-link :to="{ name: 'Task' }" @click="title='首页'" :class="title==='首页'?'link active':'link'" >
    <el-icon :size="20"><Menu /></el-icon>
     <span style="margin-left: 10px;">任务</span>
  </router-link>
 <router-link :to="{ name: 'Data' }" :class="title==='课程'?'link active':'link'" @click="title='课程'">
  <el-icon :size="20"><FolderOpened /></el-icon>
   <span style="margin-left: 10px;">资料</span>
 </router-link>
</div>
      </el-aside>
      <el-container>
        <el-header class="top">
          <div style="float: left;margin-top: 15px;font-size: 18px;margin-left: 570px;">
           虚拟现实技术
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
import { watch, onMounted, ref } from 'vue'
const title=ref('章节')
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

// 组件挂载时使用参数
onMounted(() => {
  console.log('组件挂载:', props.courseId, props.teacherId)
  fetchResource()
})

// 监听参数变化（当在同一路由内改变参数时）
watch(() => props.courseId, (newId) => {
  console.log('ID变化:', newId)
  fetchResource()
})

// 使用参数的业务方法
const fetchResource = () => {
  // 注意：路由参数默认是字符串，需要时进行类型转换
  const resourceId = Number(props.courseId)
  
  console.log(`请求数据: ID=${resourceId}, 分类=${props.teacherId}`)
  // 实际业务：根据参数发起API请求等
}
</script>
<style scoped>

.top{
  background-color: #f1f5f5;
  height:60px;
}
.side{
   width: 150px;
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
margin-right: 10px;
font-size: 18px;
}
.active{
  background-color: #5394e3;
  border-radius: 20px;
  color: aliceblue;
}
</style>