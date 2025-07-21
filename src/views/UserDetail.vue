<template>
   <div style="padding: 10px;font-size: 25px;">学生表</div>
    <hr>
  <el-table :data="filterStudentData" style="width: 100%">
    <el-table-column label="学生ID" prop="ID" />
    <el-table-column label="姓名" prop="name" />
    <el-table-column label="手机号" prop="phoneNumber" />
    <el-table-column label="密码" prop="password" />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="searchStudent" size="small" placeholder="请输入任意字段搜索" />
      </template>
    </el-table-column>
  </el-table>
   <div style="padding: 10px;font-size: 25px;margin-top: 20px;">教师表</div>
    <hr>
  <el-table :data="filterTeacherData" style="width: 100%">
    <el-table-column label="老师ID" prop="ID" />
    <el-table-column label="姓名" prop="name" />
    <el-table-column label="手机号" prop="phoneNumber" />
    <el-table-column label="密码" prop="password" />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="searchTeacher" size="small" placeholder="请输入任意字段搜索" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { getAllStudents, getAllTeachers } from '@/utils/api'
import { computed, ref, onMounted } from 'vue'

interface Student {
  ID: string
  name: string
  phoneNumber: string
  password: string
}

interface Teacher {
  ID: string
  name: string
  phoneNumber: string
  password: string
}

const searchStudent = ref('')
const searchTeacher = ref('')
const studentData = ref<Student[]>([])
const teacherData = ref<Teacher[]>([])

const filterStudentData = computed(() =>
  studentData.value.filter(
    (data) =>
      !searchStudent.value ||
      data.name.toLowerCase().includes(searchStudent.value.toLowerCase()) ||
      data.ID.toLocaleLowerCase().includes(searchStudent.value.toLocaleLowerCase()) ||
      data.phoneNumber.toLocaleLowerCase().includes(searchStudent.value.toLocaleLowerCase())
  )
)

const filterTeacherData = computed(() =>
  teacherData.value.filter(
    (data) =>
      !searchTeacher.value ||
      data.name.toLowerCase().includes(searchTeacher.value.toLowerCase()) ||
      data.ID.toLocaleLowerCase().includes(searchTeacher.value.toLocaleLowerCase()) ||
      data.phoneNumber.toLocaleLowerCase().includes(searchTeacher.value.toLocaleLowerCase())
  )
)

onMounted(() => {
  getAllStudents().then(res => {
    console.log(res.students)
    studentData.value = Object.entries(res.students).map(([studentId, studentInfo]) => ({
      ID: studentId,
      name: studentInfo.姓名,
      phoneNumber: studentInfo.手机号,
      password: studentInfo.密码
    }))
  })
  getAllTeachers().then(res => {
    console.log(res.teachers)
    teacherData.value = Object.entries(res.teachers).map(([teacherId, teacherInfo]) => ({
      ID: teacherId,
      name: teacherInfo.姓名,
      phoneNumber: teacherInfo.手机号,
      password: teacherInfo.密码
    }))
  })
})
</script>