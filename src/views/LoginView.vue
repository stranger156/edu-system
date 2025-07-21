<template>
<div class="out">
    <div style=" font-size: 80px;text-align: center;color: aliceblue;">EDU SYSTEM</div>
	<div class="login-container">
		 <div class="left-container">
            <div class="title"><span v-show="iflogin">登录</span>
			<span v-show="!iflogin">注册</span></div>
            <div class="input-container">
                <form >
                  <input v-show="!iflogin"  name="username" type="text" v-model="loginForm.name" placeholder="请输入用户名" >
                <input type="text" name="phone"  v-model="loginForm.phone" placeholder="请输入电话号码" autocomplete="tel">
                <input type="password"  v-model="loginForm.password" placeholder="请输入密码" autocomplete="current-password" >
				<input v-show="!iflogin" type="password" v-model="loginForm.newpassword" placeholder="请再次输入密码"  autocomplete="new-password" >
                  <el-select
      v-model="loginForm.root"
      placeholder="选择用户类型"
      size="large"
      style="width: 240px"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    </form>
            </div>
            <div class="message-container">
                <span v-show="iflogin" @click="iflogin=!iflogin">暂无账号？去注册</span>
				  <span v-show="!iflogin" @click="iflogin=!iflogin">已有账号？去登录</span>
            </div>
        </div>
        <div class="right-container">
            <div class="regist-container">
                
            </div>
            <div class="action-container">
                <span @click="log">提交</span>
            </div>
        </div>
	</div>
  <div class="container">
     <FishEffect  />
</div>
</div>
</template>
<script setup >
import { ref,reactive } from "vue";
import FishEffect from "../components/FishEffect.vue"
import { login, register } from "@/utils/api.ts";
import { ElMessage } from 'element-plus'  // 引入 ElMessage
import router from "@/router";
import { useUserStore } from "@/stores/token";
const userStore=useUserStore()
const loginForm=ref({
    name:'',
	phone:"",
	password:"",
	newpassword:'',
	root:""
})
const options=[
      {
    value: 0,
    label: '学生',
  },
  {
    value: 1,
    label: '教师',
  }, {
    value: 2,
    label: '管理员',
  }
]
const iflogin=ref(true)
const isLoading = ref(false);
const log = async () => {
    if (isLoading.value) return; // 如果正在提交，则阻止重复执行

    isLoading.value = true; // 开始提交，设置加载状态

    try {
        if (iflogin.value) {
            // --- A. 登录逻辑 ---

            // a. 前端校验
            if (!loginForm.value.phone || !loginForm.value.password || loginForm.value.root === '') {
                ElMessage.error('手机号、密码和用户类型不能为空');
                return; // 结束函数执行
            }

            // b. 调用 API，并使用 await 等待其完成
            const res = await login(loginForm.value);

            // c. 处理 API 响应
            if (res.code === 200) {
                ElMessage.success('登录成功！');

                // 关键步骤：在数据完全设置好之后再跳转
                userStore.setLoginInfo(res.token, String(loginForm.value.root)); // 确保存入的是字符串

                // 跳转到主页或仪表盘
                router.push('/home');
            } else {
                // 由后端返回的业务错误，如“密码错误”
                ElMessage.error(res.message || '登录失败，请检查您的凭据');
            }

        } else {
            // --- B. 注册逻辑 ---

            // a. 前端校验
            if (!loginForm.value.name || !loginForm.value.phone || !loginForm.value.password || !loginForm.value.newpassword || loginForm.value.root === '') {
                ElMessage.error('所有注册信息均不能为空');
                return;
            }
            if (loginForm.value.password !== loginForm.value.newpassword) {
                ElMessage.error('两次输入的密码不一致');
                return;
            }

            // b. 调用 API
            const res = await register(loginForm.value);

            // c. 处理响应
            if (res.code === 200) {
                ElMessage.success('新用户注册成功！请登录。');
                // 注册成功后，自动切换回登录界面，并清空部分表单
                iflogin.value = true;
                loginForm.value.newpassword = ''; // 清空确认密码
            } else {
                // 由后端返回的业务错误，如“手机号已被注册”
                ElMessage.error(res.message || '注册失败，请稍后重试');
            }
        }
    } catch (error) {
        // --- C. 统一的错误处理 ---
        // 捕获所有 await 过程中可能发生的异常，如网络错误、服务器崩溃等
        console.error("Request failed:", error);
        ElMessage.error('请求失败，请检查您的网络连接或联系管理员');

    } finally {
        // --- D. 无论成功还是失败，最后都结束加载状态 ---
        isLoading.value = false;
    }
};
</script>
<style scoped>
.out{
  width: 100vw;height:100vh;
  padding: 20px;margin: 0;
  border: none;
			background: -webkit-linear-gradient(left,rgba(89,114,192,0.8),rgba(89,114,192,0.2));
			background: -o-linear-gradient(right,rgba(89,114,192,0.8),rgba(89,114,192,0.2));
			background: -moz-linear-gradient(right,rgba(89,114,192,0.8),rgba(89,114,192,0.2));
			background: linear-gradient(to right, rgba(89,114,192,0.8), rgba(89,114,192,0.2));
			background-size: 400% 400%;
			animation: gradientBG 5s ease infinite;}
			@keyframes gradientBG {
			0% {
			background-position: 0% 50%;
			}
			50% {
			background-position: 100% 50%;
			}
			100% {
			background-position: 0% 50%;
			}
    }
    .container{
			margin:0;
			padding:0;
			background-color:transparent;
			width:100%;
			height:200px;
			z-index:99;
			position:fixed;
			bottom:0;
			left:0;}

 .login-container {
            width: 600px;
            margin: 0 auto;
            top: 300px;
      transform: translateY(50px);
            border-radius: 15px;
            box-shadow: 0 10px 50px 0px rbg(59, 45, 159);
            background-color: rgb(95, 76, 194);
			opacity: 0.7;
        }

        .left-container {
            display: inline-block;
            width: 450px;
            height: calc(100%);
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
            padding: 40px;
            background-image: linear-gradient(to bottom right, rgb(118, 76, 163), rgb(92, 103, 211));
        }

        .title {
            color: #fff;
            font-size: 18px;
            font-weight: 200;
        }

        .title span {
            border-bottom: 3px solid rgb(237, 221, 22);
        }

        .input-container {
            padding: 20px 0;
        }

        input {
            border: 0;
            background: none;
            outline: none;
            color: #fff;
            margin: 20px 0;
            display: block;
            width: 100%;
            padding: 5px 0;
            transition: .2s;
            border-bottom: 1px solid rgb(199, 191, 219);
        }

        input:hover {
            border-bottom-color: #fff;
        }

        ::-webkit-input-placeholder {
            color: rgb(199, 191, 219);
        }

        .message-container {
            font-size: 14px;
            transition: .2s;
            color: rgb(199, 191, 219);
            cursor: pointer;
        }

        .message-container:hover {
            color: #fff;
        }

        .right-container {
            width: 150px;
            display: inline-block;
            height: calc(100%);
            vertical-align: top;
            padding: 60px 0;
        }

        .regist-container {
            text-align: center;
            color: #fff;
            font-size: 18px;
            font-weight: 200;
        }

        .regist-container span {
            border-bottom: 3px solid rgb(237, 221, 22);
        }

        .action-container {
            font-size: 10px;
            color: #fff;
            text-align: center;
            position: relative;
            top: 200px;
        }

        .action-container span {
            border: 1px solid rgb(237, 221, 22);
            padding: 10px;
            display: inline;
            line-height: 20px;
            border-radius: 20px;
            position: absolute;
            bottom: 10px;
            left: calc(72px - 20px);
            transition: .2s;
            cursor: pointer;
        }

        .action-container span:hover {
            background-color: rgb(237, 221, 22);
            color: rgb(95, 76, 194);
        }

</style>