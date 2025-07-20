import axios from "axios";
import { ElMessage } from 'element-plus'
enum MSGS{
  "操作成功"=101,
  "用户名或密码输入不规范"=401,
  "用户名或密码输入错误"=303,
  "用户名未被注册"=302,
  "该用户名已被注册"=309,
  "邮箱不存在"=402,
  "旧密码错误"=307,
  "权限不足，非用户"=310,
  "新密码不能与旧密码相同"=305,
  "两次输入不一致"=306,
  "书号和序列号重复"=501
}

declare module 'axios'{
interface AxiosInstance{
  (config:AxiosRequestConfig):Promise<any>
}
}
const $http = axios.create({
  baseURL: "http://tasedu.s7.tunnelfrp.com",
  timeout: 1000000,
  headers:{
  'Content-Type': 'multipart/form-data' 
  }
});


/**
 * 请求拦截
 */

$http.interceptors.request.use(config=> {
  config.headers=config.headers||{}
   const token=localStorage.getItem("token")
  if(localStorage.getItem('token'))
   {
      config.headers.Authorization=`Bearer ${token}`||''
   }
    return config;
  }
);
/**
 * 响应拦截
 */
$http.interceptors.response.use((res) => {
const code:number=res.status
if(code!=200){
  MSGS[code]
  ElMessage.error(MSGS[code])
  return Promise.reject(res.data)
}
    return res.data;
  },
  (err: any) => {
    console.log(err);
  }
);

export default $http
