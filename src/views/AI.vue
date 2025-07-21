
<template>
  <div class="common-layout">
    <el-container style="height: 100%;">
      <el-aside width="200px" style="border-right: 2px blanchedalmond solid;height: 100%;">
        <div style="font-size: 20px;padding: 10px;text-align: center;">AI聊天助手</div>
        <div v-for="item in history" class="history">
            <el-icon :size="16"><ChatDotRound /></el-icon>
            <span style="margin-left: 5px;font-size: 16px;">{{ item.name.slice(0,8) }}</span>
            <span v-show="item.name.length>8">...</span>
        </div>
      </el-aside>
      <el-container>
        <el-header>
            <div style="text-align: center;margin-top: 10px;">
            <span style="font-size: 16px;">{{ title.slice(0,20) }}</span>
            <span v-show="title.length>15">...</span>
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

<script  setup >
import { get_chatID, getChatIDByStudentWIthID, getSessions, getSessionsByID, sendQuestion } from '@/utils/api';
import { onBeforeMount, onMounted, ref } from 'vue';
import {marked} from 'marked';
import { nextTick } from 'vue';
import { useMathJax } from '@/utils/useMathJax';
const chatId=ref()
const state=ref()
const history=ref([])
const sessionid=ref()
const list=ref([])
const title=ref('')
const input=ref()
const messageList=ref([])
const fullResponse = ref(''); // 用于存储完整的响应内容
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
const compiledMarkdown=(dialog)=>{
      let string=marked(dialog)
      useMathJax(string)
      return string;
    }
    	/*内容显示过多时自动滑动*/
	async function setScrollToBottom() {
	  await nextTick()
	  let chat = document.querySelector("#chat")
	  chat.scrollTop = chat.scrollHeight
	}
// 发送提问
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
        messageList.value=res.data.messages
        console.log(messageList.value)
         setScrollToBottom()
    })
 }

}
onMounted(async()=>{
    state.value=localStorage.getItem('root')
    // 学生用户获取聊天助手
    if(state.value==='0'){
        let result=await getChatIDByStudentWIthID(props.courseId,props.teacherId)
        console.log(result)
        chatId.value=result.chatID
    }
    //教师获取聊天助手
    if(state.value==='1'){
    let result=await get_chatID(props.courseId)
    chatId.value=result.chatID
   }
    let res=await getSessions( chatId.value)
    history.value=res.data
    sessionid.value=history.value[0].id
    title.value=history.value[0].name
    getSessionsByID(chatId.value,sessionid.value).then(res=>{
        messageList.value=res.data.messages
        console.log(messageList.value)
         setScrollToBottom()
    })

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
}
.common-layout{
    background-color: #e3ebf2;
    padding: 0;
    height: 100%;
}
</style>