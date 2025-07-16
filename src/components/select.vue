<template>
<div class="all">
    <div>选课区</div>
    <hr>
<div v-for="item in lecture" class="cla">
{{ item.courseName}}
</div>
</div>
</template>

<script lang="ts" setup >
import { getAllCourses, getStudentLectures } from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/token';
const user=useUserStore()
const lecture=ref([{Tno: 1,
courseID: 1,
courseName: "测试课程",
teacherName: "测试老师"}])
onMounted(()=>{
    getStudentLectures().then(res=>{
        console.log(res.lectures)
        lecture.value=res.lectures
    })
})
</script>

<style scoped>
.all{
    padding: 10px;
     width: 500px;
    height: 300px;
    border: 2px solid rgb(39, 155, 194); /* 增加了'solid'样式 */
    border-radius: 5px;
}
.cla{
    margin-top: 5px;
    background-color: #cdeef4;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
}
</style>