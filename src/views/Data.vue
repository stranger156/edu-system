<template>
  <div class="materials-container">
    <div v-for="material in materials" :key="material.filename" class="material-card">
      <div class="material-info">
        <div class="file-icon">
          <DocumentIcon v-if="material.type === 'doc'" class="w-8 h-8" />
          <ArchiveIcon v-else class="w-8 h-8" />
        </div>
        <div class="file-details">
          <h3 class="filename">{{ material.filename }}</h3>
          <p class="upload-info">上传时间：{{ material.uploadTime }}</p>
        </div>
      </div>
      <div class="action-buttons">
        <button @click="downloadFile(material.filename)" class="download-btn">
          下载文档
        </button>
        <button @click="previewFile(material.filename)" class="preview-btn">
          在线预览
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { DocumentIcon, ArchiveIcon } from '@heroicons/vue/24/outline'
import axios from 'axios'

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

interface Material {
  filename: string
  type: 'doc' | 'other'
  uploadTime: string
  // 根据实际接口返回字段补充
}

const materials = ref<Material[]>([])

// 获取资料列表
const fetchMaterials = async () => {
  try {
    const response = await axios.get('/api/materials', {
      params: {
        courseId: props.courseId,
        teacherId: props.teacherId
      }
    })
    materials.value = response.data.map((item: any) => ({
      filename: item.file_name,
      type: item.file_type === 'doc' ? 'doc' : 'other',
      uploadTime: new Date(item.upload_time).toLocaleString()
    }))
  } catch (error) {
    console.error('获取资料失败:', error)
  }
}

// 文件下载
const downloadFile = async (filename: string) => {
  try {
    const response = await axios.get('/api/download', {
      params: { filename },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('文件下载失败:', error)
  }
}

// 文件预览
const previewFile = async (filename: string) => {
  try {
    // 使用Google Docs Viewer实现预览
    const previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      `${window.location.origin}/api/download?filename=${filename}`
    )}&embedded=true`
    
    window.open(previewUrl, '_blank', 'width=800,height=600')
  } catch (error) {
    console.error('文件预览失败:', error)
  }
}

onMounted(() => {
  fetchMaterials()
})
</script>

<style scoped>
.materials-container {
  @apply grid gap-4 p-4;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.material-card {
  @apply bg-white rounded-lg shadow-md p-4 flex flex-col justify-between;
  transition: transform 0.2s;
}

.material-card:hover {
  @apply transform scale-102;
}

.material-info {
  @apply flex items-center gap-4 mb-4;
}

.file-icon {
  @apply text-blue-500;
}

.file-details {
  @apply flex-1;
}

.filename {
  @apply text-lg font-medium text-gray-800 truncate;
}

.upload-info {
  @apply text-sm text-gray-500;
}

.action-buttons {
  @apply flex gap-2;
}

.download-btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors;
}

.preview-btn {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors;
}
</style>