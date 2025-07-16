import { defineStore } from "pinia";
export const useUserStore =defineStore('user',{
    state(){
        return{           
            user:{ 
                token:localStorage.getItem('token')||'',
       
            }
         }
     },
     actions:{
        setLoginInfo(token:any){
            localStorage.setItem("token",token);
           
            this.user.token=token;
     
        }
     }
})