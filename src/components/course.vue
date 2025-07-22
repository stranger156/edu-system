<template>
  <div class="all">
    <div class="list-header"><div>{{ pageTitle }}</div><hr></div>
    <div class="scrollable-content">
      <div v-if="isLoading" class="loading-state">正在加载...</div>
      <div v-else-if="array.length === 0" class="empty-state">{{ emptyMessage }}</div>
      <div v-else>
        <!-- :key 现在使用一个更唯一的组合键，防止重复 -->
        <!-- .cla 现在只负责卡片样式，不再负责内部布局 -->
        <div v-for="item in array" :key="item.id || `${item.courseID}-${item.Tno}`" class="cla">
          
          <!-- **核心修改: 新增 item-wrapper 作为横向 Flex 容器** -->
          <div class="item-wrapper">
            
            <!-- 1. 左侧信息区容器 -->
            <div class="info-section">
              <div class="course-title">{{ item.courseName }}</div>
              
              <!-- 学生和老师视图共享同一个 P 标签 -->
              <p v-if="user.root == '0'" class="teacher-name">
                授课教师: {{ item.teacherName }}
              </p>
              
              <!-- 管理员视图 (如果需要不同样式或内容) -->
              <p v-else-if="user.root == '2'" class="teacher-name">
                授课教师: {{ item.teacherName }} (ID: {{ item.Tno }})
              </p>
            </div>

            <!-- 2. 右侧按钮区容器 (只对学生和老师显示) -->
            <div v-if="user.root == '0' || user.root == '1'" class="action-section">
              <el-button 
                type="primary" 
                plain 
                size="small" 
                @click.stop="handleWeaknessCheck(item.courseID, item.teacherID)"
              >
                薄弱环节分析
              </el-button>
            </div>
            
          </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllLectures, getCourseByStudent, getTeacherLectures, getMyWeaknessSummary, getClassSummary } from '@/utils/api';
import { onMounted, ref, computed, watch } from 'vue'; // 1. 引入 watch
import { useUserStore } from '@/stores/token';
import { storeToRefs } from 'pinia';
import { ElMessageBox, ElLoading } from 'element-plus';
import { renderMathInElement } from '@/utils/useMathJax';

// --- 1. 初始化 Store 和响应式数据 ---
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const isLoading = ref(true);
const array = ref([]);

// --- 2. 计算属性 (无需修改) ---
const pageTitle = computed(() => {
  // 使用宽松比较 `==` 来避免数字和字符串类型不匹配的问题
  if (user.value.root == '0') return '我学的课';
  if (user.value.root == '1') return '我教的课';
  if (user.value.root == '2') return '所有课程';
  return '课程列表';
});

const emptyMessage = computed(() => {
  if (user.value.root == '0') return '您还没有选择任何课程';
  if (user.value.root == '1') return '您还没有创建任何课程';
  if (user.value.root == '2') return '系统中还没有任何课程';
  return '暂无课程';
});

// --- 3. 核心数据获取逻辑 (封装成一个函数) ---
const fetchCourses = async () => {
  if (user.value.root === null || user.value.root === undefined) {
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  array.value = [];

  try {
    let response;
    // 根据角色调用不同的 API
    if (user.value.root == '0') {
      response = await getCourseByStudent();
      array.value = response.courses || [];
      console.log(array.value)
    } else if (user.value.root == '1') {
      response = await getTeacherLectures();
      array.value = response.lectures || [];
    } else if (user.value.root == '2') {
      // 管理员获取所有授课信息
      response = await getAllLectures(); // 假设这个 API 返回您提供的 JSON 结构
      let lectures = response.lectures || [];
      
      // **核心：按课程号、老师号排序**
      lectures.sort((a, b) => {
        // 首先比较课程 ID
        if (a.courseID !== b.courseID) {
          return a.courseID - b.courseID;
        }
        // 如果课程 ID 相同，则比较老师 Tno
        return a.Tno - b.Tno;
      });
      
      array.value = lectures;
    } else {
      console.error(`Invalid user root: ${user.value.root}`);
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    array.value = []; // 确保出错时数组为空
  } finally {
    isLoading.value = false;
  }
};

// --- 4. 使用 watch 替代 onMounted 的主要职责 ---
// 侦听 user.root 的变化
watch(
  () => user.value.root, // 我们要侦听的目标
  (newRoot, oldRoot) => {
    // 只有当 root 值真实存在时才触发数据获取
    if (newRoot !== null && newRoot !== undefined) {
      console.log(`User root changed from ${oldRoot} to ${newRoot}. Fetching courses...`);
      fetchCourses();
    }
  },
  {
    immediate: true // <-- 这是关键！它让 watch 在组件初始化时立即执行一次处理函数
  }
);

const handleWeaknessCheck = async (courseID: number, teacherID: number) => {
  // 1. 显示加载动画
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在进行智能分析...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    let apiCall;
    if (user.value.root == '0') { // 学生调用个人总结接口
      apiCall = getMyWeaknessSummary(courseID, teacherID);
    } else if (user.value.root == '1') { // 老师调用班级总结接口
      apiCall = getClassSummary(courseID, teacherID);
    } else {
      loadingInstance.close();
      return; // 其他角色无此功能
    }

    const res = await apiCall;
    loadingInstance.close(); // 成功或失败后都要关闭加载

    // 2. 显示结果弹窗
    const summaryText = res.summary || (res.data && res.data.总结内容) || '暂无总结信息。';
     ElMessageBox.alert(
      // 消息内容：我们依然需要将 \n 转换为 <br>
      summaryText.replace(/\n/g, '<br />'), 
      '薄弱知识点分析', 
      {
        confirmButtonText: '好的',
        // 必须开启，才能渲染 <br>
        dangerouslyUseHTMLString: true,
        // **新增**: 给弹窗一个唯一的 ID，方便我们精确地渲染它
        customClass: 'mathjax-message-box'
      }
    ).then(() => {
      // **弹窗已关闭，这里是 .then 的回调，时机不对**
      // 我们需要在弹窗打开后立即渲染
    }).catch(() => { /* ... */ });

    // **正确的时机在这里：alert 调用后，立即执行**
    // ElMessageBox 会同步地将 DOM 插入页面，所以我们可以立即查找并渲染它
    // 我们给它一点点延迟，以确保万无一失
    setTimeout(() => {
      const messageBoxElement = document.querySelector('.mathjax-message-box');
      if (messageBoxElement) {
        renderMathInElement(messageBoxElement);
      }
    }, 100); // 100毫秒的延迟通常足够了

  } catch (error: any) {
    loadingInstance.close(); // 确保异常时也关闭加载
    console.error("Failed to fetch weakness summary:", error);
    ElMessageBox.alert(error.message || '请求失败，请稍后再试。', '错误', {
      confirmButtonText: '关闭',
    }).catch(() => {});
  }
};
</script>

<style scoped>
/* --- 2. 通用卡片样式 (适用于所有列表项) --- */
.cla {
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  cursor: pointer;
}
/* --- 1. 通用布局样式 (适用于所有页面) --- */
.all {
  width: 100%;
  height: 100%;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.list-header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff; /* 统一使用蓝色主题线 */
  flex-shrink: 0;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 15px;
}

.loading-state, .empty-state {
  text-align: center;
  padding-top: 50px;
  font-size: 16px;
  color: #888;
}

/* --- 2. 通用卡片样式 (适用于所有列表项) --- */
.cla {
  margin-bottom: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.cla:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* 新增：课程标题的样式 */
.course-title {
    font-size: 16px; /* 假设这是主要的字体大小 */
    font-weight: bold;
}

/* 新增：教师姓名的样式 */
.teacher-name {
    font-size: 13px; /* 设置一个更小的字体 */
    color: #555;     /* 使用一个柔和的颜色 */
    margin-top: 4px; /* 与课程标题之间增加一点间距 */
}

.cla:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* 新增：课程标题的样式 */
.course-title {
    font-size: 16px; /* 假设这是主要的字体大小 */
    font-weight: bold;
}

/* 新增：教师姓名的样式 */
.teacher-name {
    font-size: 13px; /* 设置一个更小的字体 */
    color: #555;     /* 使用一个柔和的颜色 */
    margin-top: 4px; /* 与课程标题之间增加一点间距 */
}
.item-wrapper {
  /* 1. 启用 Flexbox */
  display: flex;
  /* 2. 让子元素两端对齐 (一个靠左，一个靠右) */
  justify-content: space-between; 
  /* 3. 让子元素在交叉轴上 (垂直方向) 居中 */
  align-items: center;
  /* 4. 在左右区域之间创建一个间隙 */
  gap: 16px;
}

.info-section {
  /* 5. 允许信息区在必要时收缩，并处理内容溢出 */
  flex: 1 1 auto;
  min-width: 0; /* 防止内容撑破容器 */
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  /* 6. 处理长标题，防止其撑破布局 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.teacher-name {
  font-size: 13px;
  color: #555;
  margin-top: 4px;
  /* 确保教师姓名也不会撑破布局 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-section {
  /* 7. 让按钮区保持其内容的原始宽度，不拉伸也不收缩 */
  flex-shrink: 0;
}
</style>