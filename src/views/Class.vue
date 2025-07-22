<template>
    <!-- 学生端 -->
    <div v-if="state==='0'">
    <header> 
        <button :class="model===true?'select active':'select'" @click="model=true">已选课程</button>
        <button :class="model===false?'select active':'select'" @click="model=false" class="select">选课</button>
        <hr>
    </header>
    <div v-show="model" style="margin-top: 50px;">
          <div v-show="!array.length" style="margin-left: 40%;font-size: 30px;">暂无已选课程</div>
        <!-- 我学的课 -->
        <div  v-for="item in array" class="block" style="display: flex;">
            <img src="../image/class.jpg" @click="toMore(item.courseID,item.teacherID)" alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name" @click="toMore(item.courseID,item.teacherID)">{{ item.courseName }}</h1>
<div style="margin-top: 20px;"> 开课时间:{{ item. createTime}}</div>
<div style="margin-top: 10px;">结课时间：{{ item.endTime }}</div>
<div style="margin-top: 10px;">授课老师:{{ item.teacherName }}</div>
            </div> 
            <div class="learn" @click="toMore(item.courseID,item.teacherID)">进入学习</div>
        </div>
           </div>
        <!-- 选课 -->
         <div v-show="!model" style="margin-top: 50px;">
            <div v-show="!lecture.length" style="margin-left: 40%;font-size: 30px;">暂无可选课程</div>
           <div  v-for="item in lecture" class="block" style="display: flex;">
            <img src="../image/class.jpg"  alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div style="margin-top: 20px;">授课老师:{{ item.teacherName }}</div>
            </div> 
            <div class="learn" style="margin-left: 600px;" @click="select(item.courseID,item.Tno,item.courseName,item.teacherName)">加入课堂</div>
        </div>
        </div>
    </div>

    <!-- 老师端 -->
 <div v-if="state==='1'">
    <header> 
        <button :class="model===true?'select active':'select'" @click="model=true">我的课堂</button>
        <button :class="model===false?'select active':'select'" @click="model=false" class="select">添加授课</button>
        <hr>
    </header>
      <!-- 我上的课 -->
    <div style="margin-top: 50px;" v-show="model">
          <div v-show="!array.length" style="margin-left: 40%;font-size: 30px;">暂无授课课堂</div>
        <div   v-for="item in array" class="block" style="display: flex;">
            <img src="../image/class.jpg" @click="toMore(item.courseID,teacherID)" alt="" style=" cursor: pointer;">
            <div >
 <h1 class="name" @click="toMore(item.courseID,teacherID)">{{ item.courseName }}</h1>
 <div style="margin-top: 20px;"> 课程ID: {{ item.courseID}}</div>
<div style="margin-top: 10px;"> 开课时间: {{ item.createTime}}</div>
<div style="margin-top: 10px;">结课时间：{{ item.endTime }}</div>
            </div> 
            <div class="learn" @click="toMore(item.courseID,teacherID)">查看详情</div>
        </div>
           </div> 
        <!-- 选课 -->
        <div style="margin-top: 50px;" v-show="!model">
             <div v-show="!lecture.length" style="margin-left: 40%;font-size: 30px;">暂无授课课程</div>
           <div  v-for="item in lecture" class="block" style="display: flex; ">
            <img src="../image/class.jpg"  alt="">
                <div >
 <h1 class="name">{{ item.courseName }}</h1>
<div style="margin-top: 20px;">课程ID: {{ item.courseID }}</div>
                </div>
 <div class="learn" style="margin-left: 600px;" @click="addCourse(item.courseID,item.courseName)">添加授课</div>
            </div>
        </div>
    </div>

    <!-- 管理员端 -->
    <div v-if="state==='2'" class="admin-container">
        <div style="font-size: 30px;margin-bottom: 30px;margin-top: 20px;text-align: center;">授课信息表</div>
    <div class="admin-content-wrapper">
            <el-table :data="tableData" stripe border style="width: 100%;" height="100%">
                <!-- **重要**: 设置 Element Plus Table 的 height="100%" -->
                <!-- 这会让表格自动填充其父容器的高度，并实现内部滚动 -->
                
                <el-table-column prop="createTime" label="开课时间" width="200" />
                <el-table-column prop="endTime" label="结束时间" width="200" />
                <el-table-column prop="courseID" label="课程ID" width="150" />
                <el-table-column prop="courseName" label="课程名称" width="150"  />
                <el-table-column prop="Tno" label="教师ID" width="150"  />
                <el-table-column prop="teacherName" label="教师姓名" width="200"  />
                <el-table-column fixed="right" label="操作" min-width="120">
                    <template #default="scope">
                        <el-button size="large" @click="toMore(scope.row.courseID,scope.row.Tno)">
                            查看详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="actions-footer">
                <el-button type="primary" size="large" @click="openKnowledgeBaseDialog">创建新知识库</el-button>
                <el-button type="success" size="large" @click="openAddCourseDialog">添加新课程</el-button>
        </div>

        <el-dialog v-model="knowledgeBaseDialogVisible" title="创建新知识库" width="500">
            <el-form :model="knowledgeBaseForm" label-width="100px">
                <el-form-item label="知识库名称">
                <el-input v-model="knowledgeBaseForm.name" placeholder="请输入知识库的名称"></el-input>
                </el-form-item>
                
                <el-form-item label="选择文件">
                <el-upload
                    ref="uploadRef"
                    class="upload-demo"
                    action="#" 
                    :auto-upload="false"
                    :on-change="handleFileChange"
                    :on-exceed="handleExceed"
                    :limit="1"
                >
                    <template #trigger>
                    <el-button type="primary">选择文件</el-button>
                    </template>
                    <template #tip>
                    <div class="el-upload__tip">
                        请选择要上传的 PDF, Word等文档文件。
                    </div>
                    </template>
                </el-upload>
                </el-form-item>

            </el-form>
            <template #footer>
                <div class="footer">
                <el-button @click="knowledgeBaseDialogVisible = false">取消</el-button>
                <!-- **修改**: 增加 :loading 状态，防止重复点击 -->
                <el-button 
                    type="primary" 
                    @click="handleCreateKnowledgeBase" 
                    :loading="isCreating"
                >
                    确认创建
                </el-button>
                </div>
            </template>
        </el-dialog>

    <!-- b. 添加新课程弹窗 -->
     <el-dialog v-model="addCourseDialogVisible" title="添加新课程" width="500">
            <el-form :model="addCourseForm" label-width="100px">
                <el-form-item label="课程名称">
                    <el-input v-model="addCourseForm.courseName" placeholder="请输入课程的名称"></el-input>
                </el-form-item>
                <el-form-item label="关联知识库">
                    <!-- **核心修改: 下拉框现在动态绑定到 knowledgeBases ref** -->
                    <el-select 
                        v-model="addCourseForm.knowledgeBaseID" 
                        placeholder="请选择一个知识库"
                        filterable  
                        style="width: 100%;"
                    >
                        <el-option 
                            v-for="kb in knowledgeBases" 
                            :key="kb.id" 
                            :label="kb.name" 
                            :value="kb.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addCourseDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleCreateCourse">确认添加</el-button>
                </div>
            </template>
        </el-dialog>
    </div>

</template>

<script  setup lang="ts">
import { createCourseWithTeacher, getAllCourses, getAllLectures, getCourseByStudent, getNotStudentLectures, getNotTeacherLectures, getSingleUserInfo, getStudentLectures, getTeacherLectures, selectCourse } from '@/utils/api';
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { upload_file, create_knowledge_base, createCourse, getDatasets } from '@/utils/api';
// import  { Action } from 'element-plus'
const router = useRouter()
import { onBeforeMount, onMounted, ref, reactive } from 'vue';
const model=ref(true)
const lecture=ref([])
const array=ref([])
const state=ref('0')
const tableData = ref([])
const teacherID=ref()
const teacherName = ref()
const addCourseDialogVisible = ref(false);
const addCourseForm = reactive({
  courseName: '',
  knowledgeBaseID: null, // 初始值为 null
});

// b. 存储从 API 获取的知识库列表
const knowledgeBases = ref<{id: string, name: string}[]>([]);

const isReady = ref(false); // **关键**: 只有权限通过才为 true
const knowledgeBaseDialogVisible = ref(false);
const knowledgeBaseForm = ref({ name: '', description: '' });
const isCreating = ref(false); // 新增：用于控制按钮的 loading 状态

// --- el-upload 相关的状态和引用 ---
const uploadRef = ref<UploadInstance>(); // el-upload 组件的引用
const selectedFile = ref<UploadRawFile | null>(null); // 存储用户选择的文件对象


const toMore=(courseID,teacherID)=>{
  router.push({
    name: 'DetailPage',  // 使用路由名称
    params: {            // 传递参数对象
      courseId: courseID,           // 第一个参数
      teacherId: teacherID  // 第二个参数
    }
  })
}
// 添加授课
const addCourse=(courseId,courseName)=>{
     ElMessageBox.alert(`<h4>课程ID：${courseId}</h4><br><h4>课程名称：${courseName}</h4><br><h4>授课教师ID：${teacherID.value}</h4>
     <br><h4>授课教师：${teacherName.value}</h4>`, '授课信息确认框', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确认添加授课',
    callback: (action) => {
        if(action==='confirm'){
          createCourseWithTeacher(courseId).then(res=>{
                if(res.code===200){
                ElMessage({
                        type: 'sucess',
                        message: res.message,
                    })
                    start()
                }
            })
        }
    },
  })
}
//加入课堂按钮
const select=(courseId,teacherId,courseName,teacherName)=>{
    const params={
        courseId:courseId,
        teacherId:teacherId
    }
     ElMessageBox.alert(`<h4>课程ID：${courseId}</h4><br><h4>课程名称：${courseName}</h4><br>
     <h4>授课教师ID：${teacherId}</h4><br><h4>授课教师：${teacherName}</h4>`, '课程信息确认框', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确认加入课堂',
    callback: (action) => {
        if(action==='confirm'){
            selectCourse(params).then(res=>{
                console.log(res)
                if(res.code===200){
                ElMessage({
                        type: 'sucess',
                        message: res.message,
                    })
                    start()
                }
            })
        }
    },
  })

}

const start = async () => {
    console.log(state.value)
    // 根据角色获取数据
    if (state.value === '0') {
        // 学生端数据获取
        const [courseRes, lectureRes] = await Promise.all([
            getCourseByStudent(),
            getNotStudentLectures()
        ]);
        if (courseRes.code === 200) array.value = courseRes.courses;
        if (lectureRes.code === 200 && lectureRes.lectures) lecture.value = lectureRes.lectures;

    } else if (state.value === '1') {
        // 老师端数据获取
        const [userInfoRes, teacherLecRes, notTeacherLecRes] = await Promise.all([
            getSingleUserInfo(),
            getTeacherLectures(),
            getNotTeacherLectures()
        ]);
        if (userInfoRes.code === 200) {
            teacherID.value = userInfoRes.data.ID;
            teacherName.value = userInfoRes.data.userName;
        }
        if (teacherLecRes.code === 200) array.value = teacherLecRes.lectures;
        if (notTeacherLecRes.code === 200) lecture.value = notTeacherLecRes.lectures;

    } else if (state.value === '2') {
        // 管理员端数据获取
        const res = await getAllLectures();
        if (res.code === 200) tableData.value = res.lectures;
    }
};

onMounted(() => {
    // **步骤 A: 权限校验**
    const currentUserRoot = localStorage.getItem('root'); // 或者从 Pinia store 获取
    state.value = currentUserRoot;
    console.log("a"+currentUserRoot)

    // 检查 state 是否有效 (例如，用户是否登录)
    if (!state.value) {
        ElMessage.error('用户未登录，无法访问此页面！');
        router.push('/login'); // 重定向到登录页
        return; // 阻止后续执行
    }

    // **步骤 B: 权限校验通过，开始加载数据**
    // (这里可以根据需要添加更精细的，例如 state.value 必须是 '0', '1', '2' 中的一个)
    start().then(() => {
        // **步骤 C: 数据加载完成，允许组件渲染**
        isReady.value = true;
    }).catch(error => {
        console.error("Failed to load page data:", error);
        ElMessage.error("页面数据加载失败，请稍后重试。");
        // 即使加载失败，也可能需要显示页面框架
        isReady.value = true;
    });
});
const openKnowledgeBaseDialog = () => {
  // 重置所有状态
  knowledgeBaseForm.value.name = '';
  selectedFile.value = null;
  uploadRef.value?.clearFiles(); // 清除 el-upload 中已选择的文件列表
  knowledgeBaseDialogVisible.value = true;
};
const handleFileChange = (file) => {
  // file.raw 包含了浏览器原生的 File 对象，是我们需要上传的东西
  selectedFile.value = file.raw;
  console.log('Selected file:', selectedFile.value);
};

// 文件超出数量限制时触发
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  uploadRef.value!.handleStart(file);
  selectedFile.value = file;
};

const openAddCourseDialog = async () => {
  // 1. 清空表单
  addCourseForm.courseName = '';
  addCourseForm.knowledgeBaseID = null;
  
  // 2. 显示弹窗
  addCourseDialogVisible.value = true;

  // 3. **核心**: 异步获取知识库列表来填充下拉框
  try {
    const res = await getDatasets();
    if (res.code === 200 && Array.isArray(res.data)) {
      knowledgeBases.value = res.data;
    } else {
      ElMessage.error(res.message || '获取知识库列表失败');
    }
  } catch (error: any) {
    ElMessage.error(`请求知识库列表失败: ${error.message}`);
  }
};

// --- 提交表单的函数 ---
const handleCreateKnowledgeBase = async () => {
  // --- 步骤 1: 前端校验 ---
  if (!knowledgeBaseForm.value.name) {
    ElMessage.warning('知识库名称不能为空');
    return;
  }
  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }

  isCreating.value = true; // 开始处理，禁用按钮

  try {
    // --- 步骤 2: 调用 upload_file API ---
    const formData = new FormData();
    formData.append('file', selectedFile.value); // 'file' 是后端接收文件的字段名
    
    console.log('Uploading file...');
    const uploadRes = await upload_file(formData);

    if (uploadRes.code !== 200 || !uploadRes.data.filename) {
      // 如果上传失败，则终止流程
      ElMessage.error(uploadRes.message || '文件上传失败');
      // finally 块会执行 isCreating.value = false;
      return; 
    }

    console.log('File uploaded successfully:', uploadRes.data);
    const uploadedFilename = uploadRes.data.filename;
    console.log("答复"+uploadedFilename)

    // --- 步骤 3: 调用 create_knowledge_base API ---
    const createKbPayload = {
      kb_name: knowledgeBaseForm.value.name,
      filenames: [uploadedFilename] // 将获取到的文件名放入数组
    };
    
    console.log('Creating knowledge base with payload:', createKbPayload);
    const createKbRes = await create_knowledge_base(createKbPayload);

    if (createKbRes.code === 200) {
      // --- 步骤 4: 处理最终成功的结果 ---
      ElNotification({
        title: '成功',
        message: createKbRes.message || '知识库创建任务已启动！',
        type: 'success',
      });
      knowledgeBaseDialogVisible.value = false;
      // 在这里可以触发一个事件，让父组件刷新列表
      // emit('refresh');
    } else {
      // 处理创建知识库接口返回的业务错误
      ElMessage.error(createKbRes.message || '知识库创建失败');
    }

  } catch (error) {
    // --- 步骤 5: 统一处理网络错误或代码异常 ---
    console.error("Failed to create knowledge base:", error);
    ElMessage.error('操作失败，请检查网络或联系管理员');

  } finally {
    // --- 步骤 6: 无论成功还是失败，最后都恢复按钮状态 ---
    isCreating.value = false;
  }
};

const handleCreateCourse = async () => {
  if (!addCourseForm.courseName || !addCourseForm.knowledgeBaseID) {
    ElMessage.warning('课程名称和关联知识库都不能为空');
    return;
  }
  try {
    // 调用我们新封装的 createCourse API
    const res = await createCourse({
        courseName: addCourseForm.courseName,
        knowledgeBaseID: addCourseForm.knowledgeBaseID
    });

    if (res.code === 200) {
      ElMessage.success('新课程添加成功！');
      addCourseDialogVisible.value = false; // 关闭弹窗
      start(); // **重要**: 调用 start() 来刷新整个页面的数据，包括管理员的表格
    } else {
      ElMessage.error(res.message || '添加课程失败');
    }
  } catch (error: any) {
    ElMessage.error(`请求失败: ${error.message}`);
  }
};


onBeforeMount(()=>{
    state.value = localStorage.getItem('root')
   start()
})
</script>

<style scoped>
.select{
    width: 120px;
    height: 50px;
    font-size: 18px;
    border: none;
}
hr{
    background-color: #96c4e1;
    height: 2px;
}
.block{
    padding: 10px;
}
img{
    box-sizing:border-box;
    width:300px;
    height:150px;
    border-radius: 10px;
    margin-right: 10px;
}
.active{
background-color: #1a8fdc;
opacity: 0.8;
}
.block:hover{
img{
 box-shadow: 0px 0px 5px rgba(0, 0, 0,0.5);
}
.name{
    color: rgb(31, 102, 234);
    cursor: pointer;
}
}
.learn{
    height: 50px;
   padding: 10px;
    margin-left: 500px;
    margin-top: 100px;
    cursor: pointer;
    padding-left: 30px;
    padding-right: 30px;
    border-radius: 50px;
    color: #1a8fdc;
    border: 1px #1a8fdc solid;
}
.admin-container {
  /* 1. 设置为 Flex 容器，并垂直排列 */
  display: flex;
  flex-direction: column;
  
  /* 2. 关键：让这个容器占满其父元素的所有可用高度 */
  /*    这需要其父元素也有一个已定义的高度 */
  height: 100%; 
  width: 100%;
}

.admin-header {
  /* 3. 让头部的尺寸固定，不随内容伸缩 */
  flex-shrink: 0; 
  font-size: 30px;
  margin-bottom: 20px;
  margin-top: 20px;
  text-align: center;
}

.admin-content-wrapper {
  /* 4. **核心**: 让内容区占据所有剩余的垂直空间 */
  flex-grow: 1; 
  
  /* 5. 关键：为 Element Plus Table 的 height="100%" 提供一个有界的高度 */
  /*    同时，如果内部内容溢出，由 Table 自身处理滚动，而不是这个 wrapper */
  overflow: hidden; 
  min-height: 0; /* Flexbox hack, 防止在某些浏览器中布局计算错误 */
}

.admin-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
  padding: 20px 0;
  padding-left: 40%;
  margin-top: 20px;
  gap: 20px;
  box-sizing: border-box;
}
</style>