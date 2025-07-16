<template>
<div class="all">
    <div>我学的课</div>
<hr>
<div v-for="item in array" class="cla">
{{ item }}
</div>
</div>
</template>

<script  setup >
import { getAllCourses, getCourseByStudent, getStudentLectures } from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/token';
const user=useUserStore()
const array=ref([])
onMounted(()=>{
   getCourseByStudent().then(res=>{
    res.courses.forEach(item=>{
        array.value.push(item.courseName)
    })
    console.log(array.value)
   })
 
})
</script>

<style scoped>
.all{
     width: 500px;
    height: 300px;
    padding: 10px;
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