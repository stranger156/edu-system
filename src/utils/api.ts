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
// 学生获取练习题
export const getExam=()=>{
     return $http({
        url:'/get_student_unfinished_exams',
        method:"get"
    })
}
//学生根据练习题id获取练习题内容
export const getTest=(params:any)=>{
     return $http({
        url:`/get_exam_for_student/${params}`,
        method:"get"
    })
}

export const getStudentCourseStats=()=>{
    return $http({
        url:`/get_my_courses_with_stats`,
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

//根据课程id和教师id查找具体课程通知信息
export const getLectureNoticeByStudent=(params:any)=>{
     const formData=new FormData()
     formData.append('courseID',params.courseId)
    formData.append('teacherID',params.teacherId)
    return $http({
        url:'/getLectureNoticeByStudent',
        method:"post",
        data:formData
    })
}

//学生类
//根据课程id查找具体课程通知信息
export const getLectureNoticeByTeacher=(params:any)=>{
     const formData=new FormData()
     formData.append('courseID',params)
    return $http({
        url:'/getLectureNoticeByTeacher',
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

//学生查看所有通知
export const getAllNoticesByStudent=()=>{
     return $http({
        url:'/getAllNoticesByStudent',
        method:"get"
    })
}

// 学生根据课程id和老师id返回chatid
export const getChatIDByStudentWIthID=(params:any,param:any)=>{
  const formData=new FormData()
    formData.append('course_id',params)
    formData.append('teacher_id',param)
      return $http({
        url:'/getChatIDByStudentWIthID',
        method:"post",
        data:formData
    })
}
// 创建会话
export const createSessions=(chatid:any,session_name:any)=>{
     const formData=new FormData()
    formData.append('chat_id',chatid)
    formData.append('session_name',session_name)
      return $http({
        url:'/createSessions',
        method:"post",
        data:formData
    })
}
//根据会话id获取会话
export const getSessionsByID=(chatid:any,sessionid:any)=>{
      return $http({
        url:'/getSessionsByID',
        method:"get",
         headers:{ "Content-Type":"application/json" },
        params:{
            chat_id:chatid,
            session_id:sessionid
        }
    })
}
//询问实训助手
export const sendQuestion=(params:any)=>{
    const formData=new FormData()
     formData.append('question',params.question)
     formData.append('sessionID',params.sessionid)
     formData.append('chatID',params.chatid)
     formData.append('courseID',params.courseid)
      return $http({
        url:'/stream_and_generate',
        method:"post",
        data:formData,
        responseType: 'text', // 使用 'text' 代替 'stream'
    })
}
//询问出题助手
export const sendMessage=(params:any)=>{
      const formData=new FormData()
     formData.append('question',params.question)
     formData.append('sessionID',params.sessionid)
     formData.append('chatID',params.chatid)
     formData.append('courseID',params.courseid)
      return $http({
        url:'/generate_questions',
        method:"post",
        data:formData,
        responseType: 'text', // 使用 'text' 代替 'stream'
    })
}
//发布练习题题目和答案
export const submit_question=(params:any)=>{
     const jsonData = JSON.parse(JSON.stringify(params));
      return $http({
        url:'/submit_question',
        method:"post",
        headers: { "Content-Type": "application/json" },
        data: jsonData
    })
}
//教师查看所有通知
export const getAllNoticesByTeacher=()=>{
     return $http({
        url:'/getAllNoticesByTeacher',
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
//老师获取未开授课程
export const getNotTeacherLectures=()=>{
     return $http({
         url:'/getNotTeacherLectures',
        method:"get"
    })
}
// 老师选择授课课程
export const createCourseWithTeacher=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id',params)
      return $http({
        url:'/createCourseWithTeacher',
        method:"post",
        data:formData
    })
}

// 老师根据练习题ID获取练习题
export const get_all_exams_for_teacher=()=>{
      return $http({
        url:'/get_all_exams_for_teacher',
        method:"get"
    })
}

// 老师根据练习题ID获取练习题
export const get_all_exams_for_teacher_by_exam=(params:any)=>{
  const formData=new FormData()
     formData.append('exam_id',params)
      return $http({
        url:'/get_all_exams_for_teacher_by_exam',
        method:"post",
        data:formData
    })
}

export const getTeacherCourseStats = ()=>{
      return $http({
        url:'/get_courses_with_stats',
        method:"get"
    })
}

export const getStudentsStatsByCourse = (course_id:any,teacher_id:any)=>{
    const formData=new FormData()
     formData.append('course_id',course_id)
     formData.append('teacher_id',teacher_id)
      return $http({
        url:'/get_course_students_with_stats',
        method:"post",
        data:formData
    })
}

// 学生根据课程ID和老师ID获取练习题
export const get_exam_for_student_by_course=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id',params.courseId)
     formData.append('teacher_id', params.teacherId)
      return $http({
        url:'/get_exam_for_student_by_course',
        method:"post",
        data:formData
    })
}

// 学生根据练习题ID获取练习题
export const get_exam_for_student=(params:any)=>{
      return $http({
        url:`/get_exam_for_student/${params}`,
        method:"get",
    })
}
//学生提交答案
export const submitExamine=(params:any)=>{
    const jsonData = JSON.parse(JSON.stringify(params));
      return $http({
        url:'/student_submit',
        method:"post",
        headers: { "Content-Type": "application/json" },
         data: jsonData
    })
}

//老师提交批改
export const submitCorrect=(params:any)=>{
    const jsonData = JSON.parse(JSON.stringify(params));
      return $http({
        url:'/grade_submission',
        method:"post",
        headers: { "Content-Type": "application/json" },
         data: jsonData
    })
}

// 老师发布通知
export const publishNotice=(params:any)=>{
  const formData=new FormData()
     formData.append('courseID', params.courseId)
     formData.append('title', params.title)
     formData.append('content', params.content)
      return $http({
        url:'/publishNotice',
        method:"post",
        data:formData
    })
}
// 老师获取聊天助手id
export const get_chatID=(params:any)=>{
    const formData=new FormData()
     formData.append('courseID', params)
       return $http({
        url:'/get_chatID',
        method:"post",
        data:formData
    })
}
//根据聊天助手id获取聊天历史记录
export const getSessions=(params:any)=>{
       return $http({
        url:'/getSessions',
        method:"get",
        headers:{ "Content-Type":"application/json" },
        params:{
            chat_id:params
        }
    })
}

// 获取通知详情
export const getNoticeDetailByNoticeID=(params:any)=>{
  const formData=new FormData()
     formData.append('noticeID', params)
      return $http({
        url:'/getNoticeDetailByNoticeID',
        method:"post",
        data:formData
    })
}

// 老师根据课程ID获取文件列表
export const get_course_files_for_teacher=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id', params)
      return $http({
        url:'/get_course_files_for_teacher',
        method:"post",
        data:formData
    })
}

// 老师根据练习ID获取提交结果
export const get_exam_submissions=(params:any)=>{
      return $http({
        url:`/get_exam_submissions/${params}`,
        method:"get",
    })
}

// 老师根据提交ID获取提交内容
export const get_submission_details=(params:any)=>{
      return $http({
        url:`/get_submission_details/${params}`,
        method:"get",
    })
}

// 学生和管理员根据老师ID和课程ID获取文件列表
export const get_all_files_for_admin=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id', params.course_id)
     formData.append('teacher_id', params.teacher_id)
      return $http({
        url:'/get_all_files_for_admin',
        method:"post",
        data:formData
    })
}

// 老师下载文件
export const download=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id', params.course_id)
     formData.append('filename', params.filename)
     formData.append('teacher_id', params.teacher_id)
      return $http({
        url:'/download',
        method:"post",
        data:formData,
        responseType:'blob'
    })
}

// 获取课程学生
export const getStudents=(params:any)=>{
  const formData=new FormData()
     formData.append('courseID', params)
      return $http({
        url:'/getStudents',
        method:"post",
        data:formData
    })
}

// 获取课程作业
export const get_all_exams_for_teacher_by_course=(params:any)=>{
  const formData=new FormData()
     formData.append('course_id', params.courseId)
     formData.append('teacher_id', params.teacherId)
      return $http({
        url:'/get_all_exams_for_teacher_by_course',
        method:"post",
        data:formData
    })
}

// 获取全部学生
export const getAllStudents=()=>{
      return $http({
        url:'/getAllStudents',
        method:"get",
    })
}

// 获取全部老师
export const getAllTeachers=()=>{
      return $http({
        url:'/getAllTeachers',
        method:"get",
    })
}
function cloneDeep(params: any) {
    throw new Error("Function not implemented.")
}

// 新增：获取学生个人总结 (GET请求)
export const getMyWeaknessSummary = (course_id:number, teacher_id:number) => {
  return $http({
    url: `/get_my_weakness_summary?course_id=${course_id}&teacher_id=${teacher_id}`,
    method: 'get'
  });
};

// 新增：获取班级易错点总结 (GET请求)
export const getClassSummary = (course_id:number, teacher_id:number) => {
  return $http({
    url: `/get_class_summary?course_id=${course_id}&teacher_id=${teacher_id}`,
    method: 'get'
  });
};

export const getDailyUsageStats = () => {
  return $http({
    url: `/get_daily_usage_stats`,
    method: 'get'
  });
};

export const getTeacherUsageRanking = () => {
  return $http({
    url: `/get_teacher_usage_ranking`,
    method: 'get'
  });
};

export const upload_file = (formData) => {
  return $http({
    url: `/upload_file`,
    method: 'post',
    data: formData,
  });
};
interface CreateKnowledgeBasePayload {
  kb_name: string;
  filenames: string[]; // 明确 filenames 是一个字符串数组
}

export const create_knowledge_base = (payload: CreateKnowledgeBasePayload) => {
  // 对于 POST 请求，第二个参数就是我们要发送的 JSON 数据
  // Axios 会自动将其序列化为 JSON 字符串，并设置正确的 Content-Type header
  return $http({
    url: '/create_knowledge_base', // 后端提供的 API 端点
    method: 'post',               // 使用 POST 方法，因为我们在创建新资源
    headers: { "Content-Type": "application/json" },
    data: payload                 // **核心**: 将包含 kb_name 和 filenames 的对象作为 data 发送
  });
};

export const getDatasets = () => {
  return $http({
    url: '/getDatasets',
    method: 'get'
  });
};

// 创建新课程 (POST 请求，发送 form-data)
export const createCourse = (data) => {
  // axios 默认发送 json，我们需要创建一个 FormData 对象来发送 form-data
  const formData = new FormData();
  formData.append('knowledgeBaseID', data.knowledgeBaseID);
  formData.append('courseName', data.courseName);

  return $http({
    url: '/createCourse',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 明确指定内容类型
    }
  });
};

