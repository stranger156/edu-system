<template>
  <div class="footer-widget student-footer">
    <h4>学生快捷操作</h4>
    <p>欢迎你，同学！在这里可以快速进入“我的作业”和“课程列表”。</p>
    <div class="actions">
      <button>查看我的作业</button>
      <button>浏览所有课程</button>
    </div>
  </div>
</template>

<script setup>
// 这个组件可以非常简单，甚至不需要任何 script 逻辑
</script>

<style scoped>
.student-footer {
  background-color: #e7f5ff;
  border-left: 5px solid #007bff;
}
.footer-widget {
  padding: 20px;
  border-radius: 8px;
}
h4 { margin-top: 0; }
.actions button {
  margin-right: 10px;
  padding: 8px 15px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 5px;
  cursor: pointer;
}
.actions button:hover {
  background-color: #007bff;
  color: white;
}
</style>