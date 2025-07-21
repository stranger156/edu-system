<template>
  <div class="dynamic-footer-wrapper">
    <!-- **核心：使用 Vue 的动态组件 <component> ** -->
    <!-- `is` 属性绑定到一个计算属性，它会根据用户角色返回正确的组件 -->
    <component :is="activeFooterComponent" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';

// 1. 异步加载子组件 (最佳实践，提升性能)
//    只有在需要时，对应的组件才会被下载和解析。
const StudentFooter = defineAsyncComponent(() => import('./bottomComponents/StudentFooter.vue'));
const TeacherFooter = defineAsyncComponent(() => import('./bottomComponents/TeacherFooter.vue'));
const AdminFooter = defineAsyncComponent(() => import('./bottomComponents/AdminFooter.vue'));

// 2. 获取用户角色
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// 3. 创建一个组件映射表
const footerComponents = {
  '0': StudentFooter,
  '1': TeacherFooter,
  '2': AdminFooter
};

// 4. 创建一个计算属性，根据用户角色返回对应的组件
const activeFooterComponent = computed(() => {
  const roleKey = String(user.value.root);
  // 如果角色存在于映射表中，则返回对应的组件
  // 否则可以返回一个默认组件或者 null (这里我们选择不渲染任何东西)
  return footerComponents[roleKey] || null;
});
</script>

<style scoped>
.dynamic-footer-wrapper {
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
}
</style>