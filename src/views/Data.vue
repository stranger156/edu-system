<template>
  <div class="materials-table">
     <div style="padding: 10px;font-size: 25px;">资料库</div>
    <hr>
    <el-table :data="materials" style="width: 100%;max-height: 600px;" border>
      <!-- 文件图标列 -->
      <el-table-column label="" width="80" align="center">
        <template #default>
          <img 
            :src="materialIcon" 
            style="width: 40px; height: 40px; object-fit: contain;"
            alt="文件图标"
          />
        </template>
      </el-table-column>

      <!-- 文件名列 (已修正) -->
      <el-table-column prop="displayName" label="文件名">
      <template #default="{ row }">
          {{ formatDisplayName(row.displayName) }}
        </template>
      </el-table-column>

      <!-- 其他列 -->
      <el-table-column prop="size_kb" label="大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size_kb) }}
        </template>
      </el-table-column>
      <el-table-column prop="modified_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="handleDownload(row)">下载</el-button>
          <el-button size="small" type="primary" @click="handlePreview(row)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增：用于文件预览的弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="60%"
      @close="clearPreview"
      append-to-body
    >
      <div ref="previewContainerRef" class="preview-container"></div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { get_course_files_for_teacher, download, get_all_files_for_admin } from '@/utils/api'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { renderAsync } from 'docx-preview' // <-- 1. 导入 renderAsync
import materialIcon from '@/image/material.png'

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true
  },
  // teacherId 属性在您的代码中已定义但未使用，这里保留
  teacherId: {
    type: [String, Number],
    required: true
  }
})

// 表格数据类型定义
interface Material {
  iconPath: string
  displayName: string
  filename: string
  size_kb: number
  modified_time: string
}

// 表格数据
const materials = ref<Material[]>([])
const state = ref('')
// --- 新增：预览弹窗所需的状态 ---
const previewDialogVisible = ref(false)
const previewContainerRef = ref<HTMLDivElement | null>(null)
// --- 新增结束 ---


onMounted(async () => {
  try {
    state.value = localStorage.getItem('root')
    let res;
    if(state.value == '1'){
      res = await get_course_files_for_teacher(props.courseId)
      materials.value = res.data.courseware
      materials.value = materials.value.concat(res.data.assignments)
      materials.value = materials.value.concat(res.data.solutions)
    }else{
      res = await get_all_files_for_admin({
        'course_id': props.courseId,
        'teacher_id': props.teacherId
      })
      materials.value = res.data.files.courseware
      materials.value = materials.value.concat(res.data.files.assignments)
      materials.value = materials.value.concat(res.data.files.solutions)
    }
  } catch (error) {
    ElMessage.error('请求文件列表时出错')
    console.error(error)
  }
})

// 文件大小格式化
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return bytes + ' KB'
  }
  return (bytes / 1024).toFixed(2) + ' MB'
}

const formatDisplayName = (displayName: string) => {
  return displayName + '.docx'
}

// 下载功能 (保持不变)
const handleDownload = async (row: Material) => {
  try {
    console.log(props.courseId+row.filename+props.teacherId)
    const response = await download({
      course_id: props.courseId,
      filename: row.filename,
      teacher_id: props.teacherId // 确保传递了需要的参数
    })
    
    // 后端返回的应该是一个Blob对象
    const downloadUrl = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = downloadUrl
    // 从后端获取显示标题作为下载文件名
    link.setAttribute('download', row.displayName + '.docx') // 假设都是docx
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    ElMessage.success('下载任务已开始')
  } catch (error) {
    ElMessage.error('下载失败，请稍后重试')
    console.error('下载错误:', error)
  }
}

// --- 2. 全新重写的预览处理函数 ---
const handlePreview = async (row: Material) => {
  // a. 打开弹窗
  previewDialogVisible.value = true
  const loading = ElLoading.service({
    target: '.el-dialog',
    text: '正在加载并渲染文件，请稍候...'
  })

  try {
    // b. 确保DOM已更新，容器已准备好
    await nextTick()

    // c. 调用API获取文件Blob数据
    const fileBlob = await download({
      course_id: props.courseId,
      filename: row.filename,
      teacher_id: props.teacherId // 确保传递了需要的参数
    })

    // d. 使用 docx-preview 渲染
    if (previewContainerRef.value) {
      await renderAsync(fileBlob, previewContainerRef.value)
      ElMessage.success('文件渲染完成')
    } else {
      throw new Error('预览容器不存在')
    }
  } catch (error) {
    ElMessage.error('预览失败，文件可能已损坏或格式不支持')
    console.error('预览错误:', error)
    // 可以在容器中显示错误信息
    if(previewContainerRef.value) {
      previewContainerRef.value.innerText = '无法加载此文件的预览。'
    }
  } finally {
    // e. 无论成功与否，关闭加载动画
    loading.close()
  }
}

// --- 3. 新增：清理函数，在弹窗关闭时调用 ---
const clearPreview = () => {
  if (previewContainerRef.value) {
    // 清空容器内容，防止下次打开时看到旧的预览
    previewContainerRef.value.innerHTML = ''
  }
}
</script>

<style scoped>
.materials-table {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  /* box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); */
}

.el-table {
  margin-top: 20px;
}

.el-button {
  margin: 0 4px;
}

.preview-container {
  height: 65vh; /* 视窗高度的65%，可以根据需要调整 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}
</style>