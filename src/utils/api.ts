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
//学生选课
export const selectCourse=(params:any)=>{
     const formData=new FormData()
     formData.append('course_id',params.courseId)
    formData.append('teacher_id',params.teacherId)
    return $http({
        url:'/selectCourse',
        method:"post",
        data:formData
    })
}
//学生查看未选课程
export const getNotStudentLectures=()=>{
     return $http({
        url:'/getNotStudentLectures',
        method:"get"
    })
}
//课程类
//根据课程id和教师id查找具体课程信息
export const getLectureInfoByID=(params:any)=>{
     const formData=new FormData()
     formData.append('courseID',params.courseId)
    formData.append('teacherID',params.teacherId)
    return $http({
        url:'/getLectureInfoByID',
        method:"post",
        data:formData
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

//管理员端
//获取所有授课信息
export const getAllLectures=()=>{
    return $http({
         url:'/getAllLectures',
        method:"get"
    })
}
 
//老师端
//老师查看授课课程
export const getTeacherLectures=()=>{
      return $http({
         url:'/getTeacherLectures',
        method:"get"
    })
}
 