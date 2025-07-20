<template>
作业的详情界面
</template>

<script lang="ts" setup >
import { getTest } from '@/utils/api';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route=useRoute()
const exam_id=route.params.id

onMounted(()=>{
    getTest(exam_id).then(res=>{
        console.log(res)
    })
})
</script>

<style scoped>

</style>