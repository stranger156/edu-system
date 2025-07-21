
<template>
  <div class="common-layout">
    <el-container style="height: 100%;">
      <el-aside width="200px" style="border-right: 2px blanchedalmond solid;height: 100%;">
        <div style="font-size: 20px;padding: 10px;text-align: center;">AI聊天助手</div>

        <div v-for="item in history" :class="item.id===sessionid?'history active':'history'" @click="change(item)">
            <el-icon :size="16"><ChatDotRound /></el-icon>
            <span style="margin-left: 5px;font-size: 16px;">{{ item.name.slice(18,26) }}</span>
            <span v-show="item.name.length>26">...</span>
        </div>

      </el-aside>
      <el-container>
        <el-header>
            <div style="text-align: center;margin-top: 10px;padding: 10px;">
            <span style="font-size: 16px;">{{ title.slice(18,26) }}</span>
            <span v-show="title.length>26">...</span>
            </div>
        </el-header>
        <el-main style="height: calc(100vh - 250px);" class="hide-scrollbar" id="chat"> 
           <div style="margin-bottom: 20px;"
           v-for="item in messageList" 
           :class="item.role==='assistant'?'left':'right'"
          >
          <div  :class="item.role==='assistant'?'chatLeft':'chatRight'"  v-html="compiledMarkdown(item.content)"></div>
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
</template>

<script setup>
import { get_chatID, getChatIDByStudentWIthID, getSessions, getSessionsByID, sendQuestion } from '@/utils/api';
import { onMounted, ref, watch } from 'vue'; // <--- 引入 watch
import { marked } from 'marked';
import { nextTick } from 'vue';
import { renderMathJax } from '@/utils/useMathJax'; // <--- 引入修正后的函数

const chatId = ref();
const state = ref();
const history = ref([]);
const sessionid = ref();
const title = ref('');
const input = ref();
const messageList = ref([]);

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

const change=(item)=>{
  console.log(item.id)
  sessionid.value=item.id
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

const sendMsg=async()=>{
    if(input.value.trim().length===0){
        input.value=''
        return 
    }
      let question=input.value.trim()
      messageList.value.push({
        content:question,
        role:'user'
      })
      input.value=''
       setScrollToBottom()
   
  const  data = await sendQuestion({
      question: question,
      sessionid: sessionid.value,
      chatid: chatId.value,
      courseid: props.courseId
    });
  // 手动解析分块响应
 if(data){
   getSessionsByID(chatId.value,sessionid.value).then(res=>{
     const processedMessages = res.data.messages.map(msg => {
            return {
                ...msg, // 复制原始消息对象的所有属性
                content: cleanAndCompile(msg.content) // 用一个统一的函数处理内容
            };
        });
        let newAnswer=processedMessages[processedMessages.length-1].content
        messageList.value=processedMessages.slice(0,processedMessages.length-1)
          setScrollToBottom();
        messageList.value.push({
        content:'',
        role:'assistant'
      })
         let charIndex = 0;
      const displayInterval = setInterval(() => {
                if (charIndex < newAnswer.length) {
                    messageList.value[messageList.value.length-1].content += newAnswer[charIndex];
                    charIndex++;
                    setScrollToBottom();
                } else {
                    clearInterval(displayInterval);
                }
            }, 50); // 调整这个数字可以改变显示速度

    })
 }
}

onMounted(async () => {
  state.value = localStorage.getItem('root');
  // 学生用户获取聊天助手
  if (state.value === '0') {
    let result = await getChatIDByStudentWIthID(props.courseId, props.teacherId);
    console.log(result);
    chatId.value = result.chatID;
  }
  //教师获取聊天助手
  if (state.value === '1') {
    let result = await get_chatID(props.courseId);
    chatId.value = result.chatID;
  }
  let res = await getSessions(chatId.value);
  history.value = res.data;
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
    margin-left: 10px;
	background-color: #f5f6f7!important;
    width: auto;
     padding: 12px 20px;
    padding-left: 26px;
    color: #3f3f3f;
    border-radius: 12px;
    max-width: 70%;
    font-size: 16px;
}
.right{
    display: flex;
    justify-content: flex-end;
}
.chatRight{
    margin-right: 10px;
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
  border: 2px white solid;
  background-color: #a0c5e6;
  color: #f5f6f7;
}
.active{
  border: 2px white solid;
  background-color: #a0c5e6;
  color: #f5f6f7;
}
</style>