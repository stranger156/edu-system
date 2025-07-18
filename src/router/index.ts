import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import Main from '@/views/Main.vue'
import Class from '@/views/Class.vue'
import Message from '@/views/Message.vue'
import DetailView from '@/views/DetailView.vue'
import Task from '@/views/Task.vue'
import Chapter from '@/views/Chapter.vue'
import Data from '@/views/Data.vue'


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
    redirect: { name: 'Chapter' }
    }
    ,{
        path: 'Chapter', // 完整路径：/user/profile
        name:'Chapter',
        component: Chapter,
        props:true
    },
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
      }
    ]
  }
    
  ],
})

export default router
