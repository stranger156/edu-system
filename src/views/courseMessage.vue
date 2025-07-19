<template>
课程通知页
</template>

<script lang="ts" setup >
import { onMounted } from 'vue';

const props = defineProps({
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
    console.log(props.courseId)
})
</script>

<style scoped>

</style>