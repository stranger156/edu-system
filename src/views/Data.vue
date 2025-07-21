<template>
  <div class="materials-table">
    <el-table :data="materials" style="width: 100%" border>
      <!-- 新增图片列 -->
      <el-table-column label="" width="80">
        <template #default="{ row }">
          <img 
            :src="set(row.iconPath)" 
            style="width: 100%; height: 100%;"
            alt="文件图标"
          />
        </template>
      </el-table-column>

      <!-- 原有文件名列 -->
      <el-table-column prop="displayName" label="文件名">
        <template #default="{ row }">
          {{ formatDisplayName(row.displayName) }}
        </template>
      </el-table-column>

      <!-- 其他列保持不变 -->
      <el-table-column prop="size_kb" label="大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size_kb) }}
        </template>
      </el-table-column>
      <el-table-column prop="modified_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleDownload(row)">下载</el-button>
          <el-button size="small" type="primary" @click="handlePreview(row)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import {get_course_files_for_teacher, download} from '@/utils/api'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import materialIcon from '@/image/material.png'

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

onMounted(async () => {
  get_course_files_for_teacher(props.courseId).then(res => {
    materials.value = res.data.courseware
  })
})

// 文件大小格式化
const formatFileSize = (bytes: number) => {
  return bytes + 'KB'
}

const formatDisplayName = (displayName: string) => {
  return displayName + '.doc'
}

const set = (iconPath: string) => {
  return materialIcon 
}

const handleDownload = async (row: Material) => {
  try {
    // 调用下载接口
    const response = await download({
      course_id: props.courseId,
      filename: row.filename
    })
    
    const downloadUrl = window.URL.createObjectURL(response)
    // 创建临时链接
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', row.filename)
    document.body.appendChild(link)
    link.click()
    
    // 清理资源
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    ElMessage.success('下载开始')
  } catch (error) {
    ElMessage.error('下载失败，请稍后重试')
    console.error('下载错误:', error)
  }
}
 
// 修改后的预览处理
const handlePreview = async (row: Material) => {
  try {
    // 调用下载接口获取文件流
    const response = await download({
      course_id: props.courseId,
      filename: row.filename
    })
 
    const previewUrl = window.URL.createObjectURL(response)
    
    // 打开新窗口预览
    const newWindow = window.open()
    if (newWindow) {
      newWindow.location.href = previewUrl
    } else {
      ElMessage.warning('请允许弹出窗口以进行预览')
    }
    
    // 延迟释放URL（根据浏览器兼容性调整）
    setTimeout(() => {
      window.URL.revokeObjectURL(previewUrl)
    }, 1000 * 60) // 1分钟后释放
    
  } catch (error) {
    ElMessage.error('预览失败，请检查文件格式')
    console.error('预览错误:', error)
  }
}
</script>

<style scoped>
.materials-table {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-table {
  margin-top: 20px;
}

.el-button {
  margin: 0 4px;
}
</style>