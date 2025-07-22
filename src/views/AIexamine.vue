
<template>
  <div class="common-layout">
    <el-container style="height: 100%;">
      <el-aside width="200px" style="border-right: 2px blanchedalmond solid;height: 100%;">
        <div  style=" min-height: 90%; max-height: 90%;display: flex;flex-direction: column;">
      <div style="font-size: 20px;padding: 10px;text-align: center;">AI出题助手</div>
        <div class="add" >
          <el-icon :size="20" style="cursor: pointer;"  @click="addHistory" ><ChatSquare /></el-icon>
          <span style="font-size: 20px;margin-left: 5px;cursor: pointer;" @click="addHistory">创建新对话</span>
        </div>

        <div v-for="item in history" :class="item.id===sessionid?'history active':'history'" @click="change(item)">
            <el-icon :size="16"><ChatDotRound /></el-icon>
            <span style="margin-left: 5px;font-size: 16px;">{{ item.name.slice(0,8) }}</span>
            <span v-show="item.name.length>8">...</span>
        </div>
        </div>  
        <div  class="btn" @click="centerDialogVisible = true">
            题目效果预览
        </div>
      </el-aside>
      <el-container>
        <el-header>
            <div style="text-align: center;margin-top: 10px;padding: 10px;">
            <span style="font-size: 16px;">{{ title.slice(0,8) }}</span>
            <span v-show="title.length>8">...</span>
            </div>
        </el-header>
        <el-main style="height: calc(100vh - 250px);" class="hide-scrollbar" id="chat"> 
           <div style="margin-bottom: 20px;"
           v-for="item in messageList" 
           :class="item.role==='assistant'?'left':'right'"
          >
          <div  :class="item.role==='assistant'?'chatLeft':'chatRight'"  v-html="compiledMarkdown(item.content,item.role)"></div>
           </div>
        </el-main>
            <el-row style="margin: 0 auto;padding-left: 20px;padding-right: 20px;width:80%;float: bottom;">
				 <div style="width: 100%; border-radius: 20px;">
          <el-input 
              style="float: left;width: 100%;--el-input-bg-color: rgb(243.9, 244.2, 244.8);border: none;padding: 10px;font-size:18px " 
              v-model="input"
              class="hide-scrollbar"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 2}"
              placeholder="给我发送消息"
              resize="none"
           @keyup.enter.native="sendMsg"
        ></el-input>
              </div>
				 <div style="margin: 0 auto;">
					<p style="color: red;font-size: 15px;margin-bottom: 5px;">
				内容由AI生成，请仔细甄别之后进行使用
					</p>
				 </div>
			 </el-row>
      </el-container>
    </el-container>
  </div>
    <el-dialog v-model="centerDialogVisible" title="题目效果预览" width="800" center>
        <div v-if="state==='1'" style="height: 50px;">
        <div  style="float: right;margin-right: 20px;">
            结束时间：  
        <el-date-picker
        v-model="end_time"
        type="datetime"
        placeholder="Select date and time"
         value-format="YYYY-MM-DD HH:mm:ss"
      />
        </div>
        <div style="float: left;margin-left: 20px;">
        练习题名:
              <el-input
    v-model="exam_name"
    style="width: 240px"
    placeholder="Please input"
    clearable
  />
        </div>
        </div>
      
    <div v-html="compiledMarkdown(test,'assistant')" style="max-height: 450px;min-height: 300px; overflow-y: auto; /* 仅垂直方向滚动 */
    overflow-x: hidden; /* 禁止水平滚动 */padding: 20px;"></div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" style="width: 60px;">取消</el-button>
        <el-button type="primary" @click="submit" style="width: 60px;" v-if="state==='1'">
          发布
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { createSessions, get_chatID, getChatIDByStudentWIthID, getSessions, getSessionsByID, sendMessage, submit_question } from '@/utils/api';
import { onMounted, ref, watch } from 'vue'; // <--- 引入 watch
import { marked } from 'marked';
import { nextTick } from 'vue';
import { renderMathJax ,useMathJax} from '@/utils/useMathJax'; // <--- 引入修正后的函数
import { ElMessageBox,ElMessage } from 'element-plus'
const chatId = ref();
const state = ref();
const history = ref([]);
const sessionid = ref();
const title = ref('');
const input = ref();
const messageList = ref([]);
const task=ref()
const exam_name = ref()
const end_time=ref()
const centerDialogVisible = ref(false)
const test=ref()
const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true
  },
  teacherId: {
    type: [String, Number],
    required: true
  }
})
const submit=()=>{
    if(!task.value){
         ElMessage({
        type: 'error',
        message: '缺少习题',
      })
      return
    }
      if(!end_time.value){
         ElMessage({
        type: 'warning',
        message: '请输入截至时间',
      })
      return
    }
        if(!exam_name.value){
         ElMessage({
        type: 'warning',
        message: '请输入练习题标签',
      })
      return
    }
let params={
    course_id:props.courseId,
    exam:task.value,
    end_time:end_time.value,
    exam_name:exam_name.value
}
submit_question(params).then(res=>{
    if(res.code===200){
        // centerDialogVisible.value=false;
            ElMessage({
        type: 'success',
        message: '成功发布习题',
      })
      centerDialogVisible.value=false
      test.value=''
      task.value=null
    }
})
}
const addHistory=async()=>{
    ElMessageBox.prompt('请输入您的会话名', '创建新会话', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputErrorMessage: 'Invalid Email',
  })
  .then(({value,action})=>{
    if(action==='confirm'){
     createSessions(chatId.value,value).then(res=>{
     getSessions(chatId.value).then(response=>{
  history.value = response.data;
     })
    change(res.data)
     })}
  })
  .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })
}
const change=(item)=>{
  sessionid.value=item.id
  title.value=item.name
   getSessionsByID(chatId.value,sessionid.value).then(res=>{
        messageList.value=res.data.messages
         setScrollToBottom()
    })
  
}

    	/*内容显示过多时自动滑动*/
async function setScrollToBottom() {
	  await nextTick()
	  let chat = document.querySelector("#chat")
	  chat.scrollTop = chat.scrollHeight
}

// 发送提问

const compiledMarkdown = (dialog,role) => {
  // 安全检查：如果输入为空或不是字符串，则直接返回空字符串
  if (!dialog || typeof dialog !== 'string') {
    return '';
  }

  let processedText = dialog;
  processedText = processedText.replace(/\(([^)]*\\.+[^)]*)\)/g, '\\($1\\)');
if(role==='user'){
   return marked(processedText.slice(processedText.indexOf('，')+1));
}
  // 最后，将完全清理干净的文本交给 marked.js 进行 HTML 转换
  return marked(processedText);
};

const cleanAndCompile = (dialog) => {
    if (!dialog || typeof dialog !== 'string') return '';
    
    // 1. 修复 LaTeX 格式
    let fixedDialog = dialog.replace(/\(([^)]*\\.+[^)]*)\)/g, '\\($1\\)');
    
    // 2. 转换为 HTML
    return marked(fixedDialog);
};

// 监听 messageList 的变化，当它更新时，执行滚动和数学公式排版
watch(messageList, () => {
    useMathJax(messageList)
    setScrollToBottom();
//   renderMathJax(); // <--- 在数据更新后调用排版
}, { deep: true }); // 使用 deep watch 来监听数组内部的变化

const sendMsg=async()=>{
    if(input.value.trim().length===0){
        input.value=''
        return 
    }
      let question=input.value.trim()
      messageList.value.push({
        content: '，'+question,
        role:'user'
      })
      input.value=''
         messageList.value.push({
        content:'AI思考中...',
        role:'assistant'
      })
      setScrollToBottom()
    const formData=new FormData()
     formData.append('question',question)
     formData.append('sessionID',sessionid.value)
     formData.append('chatID',chatId.value)
     formData.append('courseID',props.courseId)
      let token=localStorage.getItem('token')
      if(state.value==='0'){
         const response = await fetch('http://tasedu.s7.tunnelfrp.com/generate_questions_student', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${token}` },
    body:formData
  });
    // 检查响应是否正常
        if (!response.ok || !response.body) {
          throw new Error(`请求失败: ${response.status}`);
        }
        test.value=''
    centerDialogVisible.value= true
    const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
   let message = '';
 while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          // 解码并添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          
          // 处理所有完整的消息块 (以 \n\n 分隔)
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || ''; // 保留不完整的部分
          
          for (const chunk of chunks) {
            // 跳过空消息
            if (!chunk.trim()) continue;
            
            // 提取 JSON 数据部分 (移除 "data: " 前缀)
            const dataPrefix = "data: ";
            if (chunk.startsWith(dataPrefix)) {
              const jsonStr = chunk.substring(dataPrefix.length);
              
              try {
                const data = JSON.parse(jsonStr);
                if (data.type === 'content' && data.data) {
                  // 处理 Unicode 转义序列
                  const content = decodeUnicode(data.data);
                  message = content;
                  test.value=content
                }
                if(data.type==='done'){
                    task.value=data.questions
                }
              } catch (parseError) {
                console.error('JSON 解析错误:', parseError, '原始数据:', jsonStr);
              }
            } else {
              console.log('非数据块:', chunk);
            }
          }
        }

if (buffer) {
          console.warn('未处理的缓冲区内容:', buffer);
        };
            console.log(task.value)
  useMathJax(test)
 // 手动解析分块响应

   getSessionsByID(chatId.value,sessionid.value).then(res=>{
     const processedMessages = res.data.messages.map(msg => {
            return {
                ...msg, // 复制原始消息对象的所有属性
                content: cleanAndCompile(msg.content) // 用一个统一的函数处理内容
            };
        });
        messageList.value=processedMessages
          setScrollToBottom();
    })
      }
      if(state.value==='1'){
     const response = await fetch('http://tasedu.s7.tunnelfrp.com/generate_questions', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${token}` },
    body:formData
  });
      // 检查响应是否正常
        if (!response.ok || !response.body) {
          throw new Error(`请求失败: ${response.status}`);
        }
        test.value=''
    centerDialogVisible.value= true
    const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
   let message = '';
 while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          // 解码并添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          
          // 处理所有完整的消息块 (以 \n\n 分隔)
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || ''; // 保留不完整的部分
          
          for (const chunk of chunks) {
            // 跳过空消息
            if (!chunk.trim()) continue;
            
            // 提取 JSON 数据部分 (移除 "data: " 前缀)
            const dataPrefix = "data: ";
            if (chunk.startsWith(dataPrefix)) {
              const jsonStr = chunk.substring(dataPrefix.length);
              
              try {
                const data = JSON.parse(jsonStr);
                if (data.type === 'content' && data.data) {
                  // 处理 Unicode 转义序列
                  const content = decodeUnicode(data.data);
                  message = content;
                  test.value=content
                }
                if(data.type==='done'){
                    task.value=data.questions
                }
              } catch (parseError) {
                console.error('JSON 解析错误:', parseError, '原始数据:', jsonStr);
              }
            } else {
              console.log('非数据块:', chunk);
            }
          }
        }

if (buffer) {
          console.warn('未处理的缓冲区内容:', buffer);
        };
            console.log(task.value)
  useMathJax(test)
 // 手动解析分块响应

   getSessionsByID(chatId.value,sessionid.value).then(res=>{
     const processedMessages = res.data.messages.map(msg => {
            return {
                ...msg, // 复制原始消息对象的所有属性
                content: cleanAndCompile(msg.content) // 用一个统一的函数处理内容
            };
        });
        messageList.value=processedMessages
          setScrollToBottom();
    })
      }
     
      

}

 const decodeUnicode=(str)=> {
      return str.replace(/\\u([\dA-F]{4})/gi, 
        (_, p1) => String.fromCharCode(parseInt(p1, 16))
      );
    }
onMounted(async () => {
  //教师获取聊天助手
  state.value=localStorage.getItem('root')
   if (state.value === '0') {
    let result = await getChatIDByStudentWIthID(props.courseId, props.teacherId);
    console.log(result);
    chatId.value = result.courses.exam_id;
  }
  //教师获取聊天助手
  if (state.value === '1') {
    let result = await get_chatID(props.courseId);
    chatId.value = result.examID;
  }
  let res = await getSessions(chatId.value);
  history.value = res.data;
  if(history.value.length===0){
    return 
  }
  sessionid.value = history.value[0].id;
  title.value = history.value[0].name;
  getSessionsByID(chatId.value, sessionid.value).then(res => {
    const processedMessages = res.data.messages.map(msg => {
            return {
                ...msg,
                content: cleanAndCompile(msg.content)
            };
        });
        messageList.value = processedMessages;
         setScrollToBottom()
  });
})

</script>

<style scoped>
*{
    padding: 0;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.left{
    display: flex;
}
.chatLeft{
    margin-left: 20px;
	background-color: #f5f6f7!important;
    width: auto;
     padding: 12px 20px;
    padding-left: 26px;
    color: #3f3f3f;
    border-radius: 12px;
    max-width: 70%;
    font-size: 16px;
    padding-right: 20px;
    overflow: hidden;
}
.right{
    display: flex;
    justify-content: flex-end;
}
.chatRight{
    margin-right: 20px;
 background-color: #e0dfff;
width: auto;
  font-size: 16px;
  color: #3f3f3f;
max-width: 50%;
padding: 10px 15px;
border-radius: 12px;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.history{
    border-top: 1px black ;
    border-bottom: 1px black solid;
    padding: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 5px;
}
.common-layout{
    background-color: #e3ebf2;
    padding: 0;
    height: 100%;
}
.history:hover{
  border: 1px white solid;
  background-color: #a0c5e6;
  color: #f5f6f7;
}
.active{
  border:1px white solid;
  background-color: #a0c5e6;
  color: #f5f6f7;
}
.btn{
    text-align: center;
    margin-left: 30px;
    margin-right: 30px;
    border: 2px #a0c5e6 solid;
    cursor: pointer;
    height: 40px;
    font-size: 20px;
    padding: 3px;
}
.btn:hover{
    /* background-color: #95e2e8; */
     background-color: #a0c5e6;
    color: rgb(237, 244, 247);
}
.add{
   display: flex;
   align-items: center;
   margin-left: 30px;
   margin-top: 20px;
   margin-bottom: 20px;
   margin-right: 30px;
   height: 40px;
   padding: 3px;
   border-radius: 10px;
   border: 1px;
}
.add:hover{
    background-color: #a0c5e6;
    border-color: white;
    border-style: solid;
}
</style>