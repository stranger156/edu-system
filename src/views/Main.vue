<template>
 <div class="left">
          <course/>
         <selectArea/>
        </div>
          <div class="right">
          作业区
          </div>
</template>

<script lang="ts" setup >
import course from '@/components/course.vue';
import selectArea from '@/components/select.vue';
</script>

<style scoped>
.left{
width:70%;
float: left;
height:500px
}
.right{
  width: 30%;
  float:right;
  background-color: #0e7764;
  height:500px
}
</style>