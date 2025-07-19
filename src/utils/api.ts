import $http from "./request"
// 用户类
// 用户登录
export const login =(params:any)=>{
    const formData=new FormData()
    formData.append('phoneNumber',params.phone)
     formData.append('password',params.password)
     formData.append('root',params.root)
return  $http(
        {
            url:"/login",
            method:"post",
            data:formData
        })
}
//用户注册
export const register=(params:any)=> {
     const formData=new FormData()
     formData.append('name',params.name)
    formData.append('phoneNumber',params.phone)
     formData.append('password',params.password)
     formData.append('root',params.root)
return $http(
        {
            url:"/signUp",
            method:"post",
            data:formData
        })
} 
//获取用户信息
export const getSingleUserInfo=()=>{
    return $http(
        {
            url:"/getSingleUserInfo",
            method:"get",
        })
}

//课程类
//获取所有课程
export const getAllCourses=()=>{
    return $http({
        url:'/getAllCourses',
        method:"get"
    })
}

//学生端
//学生查看开课信息
export const getStudentLectures=()=>{
     return $http({
        url:'/getStudentLectures',
        method:"get"
    })
}
//学生查看已选课程
export const getCourseByStudent=()=>{
     return $http({
        url:'/getCourseByStudent',
        method:"get"
    })
}

//学生查看所有通知
export const getAllNoticesByStudent=()=>{
     return $http({
        url:'/getAllNoticesByStudent',
        method:"get"
    })
}





export const getHistory =(token:any)=>{
    console.log(token)
  return $http(
        {
            url:"/getHistory",
            method:"get",
        })
}
 

 