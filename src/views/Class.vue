<template>
    <!-- 学生端 -->
    <div v-if="state==='0'">
    <header> 
        <button :class="model===true?'select active':'select'" @click="model=true">已选课程</button>
        <button :class="model===false?'select active':'select'" @click="model=false" class="select">选课</button>
        <hr>
    </header>
    <div style="margin-top: 50px;">
        <!-- 我学的课 -->
        <div  v-show="model" v-for="item in array" class="block" style="display: flex;">
            <img src="../image/class.jpg" @click="toMore(item.courseID,item.teacherID)" alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name" @click="toMore(item.courseID,item.teacherID)">{{ item.courseName }}</h1>
<div style="margin-top: 20px;"> 创建时间:{{ item. createTime}}</div>
<div style="margin-top: 10px;">结束时间：{{ item.endTime }}</div>
<div style="margin-top: 10px;">授课老师:{{ item.teacherName }}</div>
            </div> 
            <div class="learn" @click="toMore(item.courseID,item.teacherID)">进入学习</div>
        </div>
        <!-- 选课 -->
           <div  v-show="!model" v-for="item in lecture" class="block" style="display: flex;">
            <img src="../image/class.jpg"  alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div style="margin-top: 20px;">授课老师:{{ item.teacherName }}</div>
            </div> 
            <div class="learn" style="margin-left: 600px;" @click="select(item.courseID,item.Tno,item.courseName,item.teacherName)">加入课堂</div>
        </div>
    </div>
    </div>

    <!-- 老师端 -->
 <div v-if="state==='1'">
    <header> 
        <button :class="model===true?'select active':'select'" @click="model=true">我的课堂</button>
        <button :class="model===false?'select active':'select'" @click="model=false" class="select">选课</button>
        <hr>
    </header>
    <div style="margin-top: 50px;">
        <!-- 我学的课 -->
        <div  v-show="model" v-for="item in array" class="block" style="display: flex;">
            <img src="../image/class.jpg" @click="toMore(item.courseID,item.teacherID)" alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name" @click="toMore(item.courseID,item.teacherID)">{{ item.courseName }}</h1>
<div style="margin-top: 20px;"> 创建时间:{{ item. createTime}}</div>
<div style="margin-top: 10px;">结束时间：{{ item.endTime }}</div>
            </div> 
            <div class="learn" @click="toMore(item.courseID,item.teacherID)">查看详情</div>
        </div>
        <!-- 选课 -->
           <!-- <div @click="toMore(item.courseID,item.Tno)" v-show="!model" v-for="item in lecture" class="block" style="display: flex;">
            <img src="../image/class.jpg"  alt="">
            <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div style="margin-top: 20px;">授课老师:{{ item.teacherName }}</div>
            </div> 
        </div> -->
    </div>
    </div>

    <!-- 管理员端 -->
    <div v-if="state==='2'">
        <div style="font-size: 30px;margin-bottom: 30px;margin-top: 20px;text-align: center;">授课信息表</div>
 <el-table :data="tableData" max-height="500" stripe border style="width: 100%;">
    <el-table-column prop="createTime" label="开课时间" width="200" />
    <el-table-column prop="endTime" label="结束时间" width="200" />
    <el-table-column prop="courseID" label="课程ID" width="150" />
    <el-table-column prop="courseName" label="课程名称" width="150"  />
    <el-table-column prop="Tno" label="教师ID" width="150"  />
    <el-table-column prop="teacherName" label="教师姓名" width="200"  />
     <el-table-column fixed="right" label="操作" min-width="120">
      <template #default="scope">
        <el-button  size="large"  @click="toMore(scope.row.courseID,scope.row.Tno)">
        查看详情
        </el-button>
      </template>
    </el-table-column>
  </el-table>
    </div>

</template>

<script  setup >
import { getAllCourses, getAllLectures, getCourseByStudent, getStudentLectures, getTeacherLectures, selectCourse } from '@/utils/api';
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// import  { Action } from 'element-plus'
const router = useRouter()
import { onMounted, ref } from 'vue';
const model=ref(true)
const lecture=ref([])
const array=ref([])
const state=ref('0')
const tableData = ref([])
const toMore=(courseID,teacherID)=>{
  router.push({
    name: 'DetailPage',  // 使用路由名称
    params: {            // 传递参数对象
      courseId: courseID,           // 第一个参数
      teacherId: teacherID  // 第二个参数
    }
  })
}
//加入课堂按钮
const select=(courseId,teacherId,courseName,teacherName)=>{
    const params={
        courseId:courseId,
        teacherId:teacherId
    }
     ElMessageBox.alert(`<h4>教师姓名：${teacherName}</h4><h4>课程名称：${courseName}</h4>`, '课程信息确认框', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确认加入课堂',
    callback: (action) => {
        if(action==='confirm'){
            selectCourse(params).then(res=>{
                console.log(res)
                if(res.code===200){
                ElMessage({
                        type: 'sucess',
                        message: res.message,
                    })
                }
            })
        }
    },
  })

}
onMounted(()=>{
    state.value=localStorage.getItem('root')
    //学生端
    if(state.value==='0'){
 getCourseByStudent().then(res=>{
    array.value=res.courses
  })
  getStudentLectures().then(res=>{
    lecture.value=res.lectures
  })
    }
    //老师端
    if(state.value==='1'){
        getTeacherLectures().then(res=>{
            console.log(res)
            array.value=res.lectures
        })
    }
    //管理员端
    if(state.value==='2'){
        getAllLectures().then(res=>{
            console.log(res)
            tableData.value=res.lectures
        })
    }



})
</script>

<style scoped>
.select{
    width: 120px;
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
    cursor: pointer;
}
}
.learn{
    height: 50px;
   padding: 10px;
    margin-left: 500px;
    margin-top: 100px;
    cursor: pointer;
    padding-left: 30px;
    padding-right: 30px;
    border-radius: 50px;
    color: #1a8fdc;
    border: 1px #1a8fdc solid;
}
</style>