<template>
<div>
    <div style="padding: 10px;font-size: 20px;">练习题</div>
    <div v-for="item in testList" class="test">
      <img src="../image/test.png" alt="" class="image">
      <div class="mid">
        <h3> {{ item.练习题标题 }}</h3>
        <div style="padding-top: 5px;">结束时间： {{ item.结束时间 }}</div>
      </div>
    <div :class="item.status==='已完成'?'over':'notover'"> {{ item.status }}</div>
      
    </div>

</div>
</template>

<script  setup >
import { getExam } from '@/utils/api';
import { onMounted, ref } from 'vue';
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