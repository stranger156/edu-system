<template>
  <el-table :data="filterTableData" style="width: 100%">
    <el-table-column label="学生ID" prop="ID" />
    <el-table-column label="姓名" prop="name" />
    <el-table-column label="手机号" prop="phoneNumber" />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="search" size="small" placeholder="请输入任意字段搜索" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { getStudents } from '@/utils/api'
import { computed, ref, onMounted } from 'vue'

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

interface User {
  ID: string
  name: string
  phoneNumber: string
}

const search = ref('')
const tableData = ref<User[]>([]) // 改为响应式引用

const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.ID.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()) ||
      data.phoneNumber.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())
  )
)

onMounted(() => {
  getStudents(props.courseId).then(res => {
    tableData.value = Object.entries(res.students).map(([studentId, studentInfo]) => ({
      ID: studentId,
      name: studentInfo.姓名, // 或者改为 studentInfo.name（如果接口可以调整）
      phoneNumber: studentInfo.手机号 // 或者改为 studentInfo.phoneNumber
    }))
  })
})
</script>