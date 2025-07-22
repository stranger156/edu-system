<template>
  <div class="layout-wrapper">
    <!-- 使用 el-container 来创建经典的页面布局，更符合 Element Plus 的设计哲学 -->
    <el-container>
      <!-- Main 区域 -->
      <el-main>
        <!-- 顶部行: gutter 属性在列之间创建了 20px 的间距 -->
        <el-row :gutter="20" class="top-row">
          
          <!-- 第一列: span="8" 表示占据 24 分之 8 的宽度 (即 1/3) -->
          <el-col :span="8">
            <div class="grid-content">
              <course />
            </div>
          </el-col>
          
          <!-- 第二列: span="8" -->
          <el-col :span="8">
            <div class="grid-content">
              <selectArea />
            </div>
          </el-col>

          <!-- 第三列: span="8" -->
          <el-col :span="8">
            <div class="grid-content">
              <AssignmentArea />
            </div>
          </el-col>

        </el-row>

        <!-- 底部行 -->
        <el-row class="bottom-row">
          <!-- 一个单独的列，占据全部 24 栅格 -->
          <el-col :span="24">
            <div class="grid-content">
              <BottomComponent />
            </div>
          </el-col>
        </el-row>

      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import course from '@/components/course.vue';
import selectArea from '@/components/select.vue';
import AssignmentArea from '@/components/AssignmentArea.vue';
import BottomComponent from '@/components/BottomComponent.vue';

</script>

<style scoped>
/* --- 布局核心 --- */

.layout-wrapper {
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.el-container {
  height: 100%;
}

.el-main {
  display: flex;
  flex-direction: column;
  padding: 8px;
  height: 100%;
  box-sizing: border-box;
  gap: 10px; /* **优化**: 使用 gap 来代替 margin-bottom，更现代 */
}

/* **核心修改：使用 flex 属性精确控制高度** */
.top-row {
  /*
   * flex: 0 0 65%;
   * - flex-grow: 0   => 不允许该行拉伸
   * - flex-shrink: 0 => 不允许该行收缩
   * - flex-basis: 65% => 它的理想基础高度是父容器 (el-main) 高度的 65%
   */
  flex: 0 0 60%;

  /* **重要**: 为了让内部的 el-col 和 grid-content 继承高度，需要设置 height */
  height: 55%;
  min-height: 0; /* Flexbox 修复技巧 */

  /* el-row 自身也是一个 flex 容器，我们需要让它的子元素也填满高度 */
  display: flex;
}
.top-row > .el-col {
  height: 100%; /* 让 el-col 填满 el-row 的高度 */
}


.bottom-row {
  /*
   * flex: 1 1 auto;
   * - flex-grow: 1   => **关键**: 允许该行拉伸以填充所有剩余空间
   * - flex-shrink: 1 => 允许在空间不足时收缩
   * - flex-basis: auto => 它的基础高度由内容决定，但会被 grow 拉伸
   */
  flex: 1 1 auto;
  
  height: 100%;
  min-height: 0; /* Flexbox 修复技巧 */
}
.bottom-row .el-col {
  height: 100%;
}

/* --- 内容样式 (保持不变) --- */

.grid-content {
  border-radius: 4px;
  background-color: #f9f9f9;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}

.bottom-content {
  background-color: #f0f8ff;
}
</style>