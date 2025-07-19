<template>
通知详情{{ userId }}
</template>

<script lang="ts" setup >
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const userId = route.params.id; // 直接访问
onMounted(()=>{
  console.log(route.params.id)
})
</script>

<style scoped>

</style>