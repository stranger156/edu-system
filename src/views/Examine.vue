<template>
<div style="padding: 20px;">
    <div style="padding: 10px;font-size: 25px;">练习题</div>
    <hr>
    <div style="max-height: 650px; overflow-y:scroll;">
 <div v-for="item in testList" class="test" @click="toDetail(item)">
      <img src="../image/test.png" alt="" class="image">
      <div class="mid">
        <h3> {{ item.exam_title }}</h3>
        <div style="padding-top: 5px;">结束时间： {{ item.end_time }}</div>
      </div>
    <div :class="item.status==='已完成'?'over':'notover'"> {{ item.status }}</div>
    </div>
    </div>
   

</div>
</template>

<script  setup >
import { getExam } from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router=useRouter()
const testList=ref([])
defineProps({
  courseId: {
    type: [String, Number],
    required: true
  },
  teacherId: {
    type: [String, Number],
    required: true
  }
})
const toDetail=(item)=>{
  if(item.status==='已完成'){
    return
  }
  router.push({ name: 'examineDetail', params: { id:item.exam_id} });
}
onMounted(()=>{
    getExam().then(res=>{
        console.log(res)
        testList.value=res.data
    })
})
</script>

<style scoped>
.test{
    display: flex;
    padding: 20px;
    padding-left: 50px;
    align-items: center;
    margin: 10px;
}
.test:hover{
    cursor: pointer;
    box-shadow: 0px 0px 5px rgba(0, 0, 0,0.5);
  img{
 box-shadow: 0px 0px 5px rgba(0, 0, 0,0.5);
}
h3{
    color: rgb(31, 102, 234);
}
}
.image{
    width: 80px;
    height: 80px;
}
.mid{
    width:80%;
    margin-left: 20px;
}
.over{
    font-size: 20px;
    color: rgb(15, 217, 15);
}
.notover{
     font-size: 20px;
    color: red;
}
</style>