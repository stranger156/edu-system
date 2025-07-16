<template>
    <header> <button :class="model===true?'select active':'select'" @click="model=true">已选课程</button>
        <button :class="model===false?'select active':'select'" @click="model=false" class="select">选课</button><hr></header>
    <body style="margin-top: 50px;">
        <!-- 我学的课 -->
        <div @click="toMore(item.courseID,item.teacherID)" v-if="model" v-for="item in array" class="block" style="display: flex;">
            <img src="../image/class.jpg"  alt="">
            <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div> 创建时间:{{ item. createTime}}</div>
<div>结束时间：{{ item.endTime }}</div>
<div>授课老师:{{ item.teacherName }}</div>
            </div> 
        </div>
        <!-- 选课 -->
           <div @click="toMore(item.courseID,item.Tno)" v-if="!model" v-for="item in lecture" class="block" style="display: flex;">
            <img src="../image/class.jpg"  alt="">
            <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div>授课老师:{{ item.teacherName }}</div>
            </div> 
        </div>
    </body>
</template>

<script  setup >
import { getAllCourses, getCourseByStudent, getStudentLectures } from '@/utils/api';
import { useRouter } from 'vue-router'
const router = useRouter()
import { onMounted, ref } from 'vue';
const model=ref(true)
const lecture=ref([])
const array=ref([])
const toMore=(courseID,teacherID)=>{
  router.push({
    name: 'DetailPage',  // 使用路由名称
    params: {            // 传递参数对象
      courseId: courseID,           // 第一个参数
      teacherId: teacherID  // 第二个参数
    }
  })
}
onMounted(()=>{
  getCourseByStudent().then(res=>{
    array.value=res.courses
  })
  getStudentLectures().then(res=>{
    //目前获取的是全部课程
    lecture.value=res.lectures
  })

})
</script>

<style scoped>
.select{
    width: 100px;
    height: 50px;
    font-size: 18px;
    border: none;
}
hr{
    background-color: #96c4e1;
    height: 2px;
}
.block{
    padding: 10px;
}
img{
    box-sizing:border-box;
    width:300px;
    height:150px;
    border-radius: 10px;
    margin-right: 10px;
}
.active{
background-color: #1a8fdc;
opacity: 0.8;
}
.block:hover{
img{
 box-shadow: 0px 0px 5px rgba(0, 0, 0,0.5);
}
.name{
    color: rgb(31, 102, 234);
}
}
</style>