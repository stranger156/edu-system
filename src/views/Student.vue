<template>
学生用户情况表
</template>

<script lang="ts" setup >
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
</script>

<style scoped>

</style>