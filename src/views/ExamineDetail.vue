<template>
<div style="text-align: center;font-size: 30px;padding: 20px;">{{ title }}</div>
<div style="text-align: center;">
    <span style="margin-right: 100px; color: dimgray;">开始时间：{{ start }}</span>
    <span style="margin-left: 100px;color: dimgray;">截止时间：{{ end }}</span>
</div>
</template>

<script lang="ts" setup >
import { getTest } from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
const title=ref()
const route=useRoute()
const start=ref()
const end=ref()
const select=ref([])

const exam_id=route.params.id

onMounted(()=>{
    getTest(exam_id).then(res=>{
        title.value=res.data.exam_title
        start.value=res.data.start_time
        end.value=res.data.end_times
        select.value=res.data.exam_content.选择题||[]
        console.log(res)
    })
})
</script>

<style scoped>

</style>