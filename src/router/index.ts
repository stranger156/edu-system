import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import Main from '@/views/Main.vue'
import Class from '@/views/Class.vue'
import Message from '@/views/Message.vue'
import DetailView from '@/views/DetailView.vue'
import Task from '@/views/Task.vue'
import Data from '@/views/Data.vue'
import CourseMessage from '@/views/CourseMessage.vue'
import Student from '@/views/Student.vue'
import NoticeDetail from '@/views/NoticeDetail.vue'
import AI from '@/views/AI.vue'
import Examine from '@/views/examine.vue'
import UserDetail from '@/views/UserDetail.vue'
import ExamDetail from '@/views/ExamDetail.vue'
import ExamineDetail from '@/views/ExamineDetail.vue'
import AIexamine from '@/views/AIexamine.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component:LoginView,
    },
    {
      path: '/Home',
      name: 'home',
      component: () => import("../views/HomeView.vue") ,// 动态导入
    children: [
      {
        path: '', // 完整路径：/user/profile
        name:'main',
        component: Main
      },
        {
        path: '/Class', // 完整路径：/user/profile
        name:'class',
        component: Class
      },
        {
        path: '/Message', // 完整路径：/user/profile
        name:'message',
        component: Message
      },
      {
        path: '/UserDetail', // 完整路径：/user/profile
        name:'userdetail',
        component: UserDetail
      },
      {
        path: '/notice/:id', // 预定义参数名 :id
        name: 'noticeDetail',
        component: NoticeDetail
      }
    ]
    },
  {
    path: '/detail/:courseId/:teacherId',  // 定义两个路由参数         
    component: DetailView,           // 对应的组件
    props: true ,                     // 关键设置：自动将 params 转为 props
    children:[{
     path: '',
      name: 'DetailPage', 
    redirect: { name: 'Data' }
    }
,
       {
        path: 'Task', // 完整路径：/user/profile
        name:'Task',
        component: Task,
        props:true
      }, {
        path: 'Data', // 完整路径：/user/profile
        name:'Data',
        component: Data,
        props:true
      },{
        path: 'courseMessage', // 完整路径：/user/profile
        name:'courseMessage',
        component: CourseMessage,
        props:true
      },{
        path: 'student', // 完整路径：/user/profile
        name:'student',
        component: Student,
        props:true
      },{
        path: '/detail/:courseId/:teacherId/:id/message', // 预定义参数名 :id
        name: 'detail',
        component: NoticeDetail
  },{
     path: 'Aichat', // 完整路径：/user/profile
        name:'Aichat',
        component: AI,
        props:true
  },{
     path: 'examine', // 完整路径：/user/profile
        name:'examine',
        component: Examine,
        props:true
  },{
     path: 'AIexamine', // 完整路径：/user/profile
        name:'AIexamine',
        component: AIexamine,
        props:true
  },
  {
        path: '/detail/:courseId/:teacherId/:id/examDetail', // 预定义参数名 :id
        name: 'examDetail',
        component: ExamDetail
  }, {
        path: '/detail/:courseId/:teacherId/:id/examineDetail', // 预定义参数名 :id
        name: 'examineDetail',
        component: ExamineDetail
  }
    ]
  }
    
  ],
})

export default router