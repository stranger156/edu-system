import { defineStore } from "pinia";
export const useUserStore =defineStore('user',{
    state(){
        return{           
            user:{ 
                token:localStorage.getItem('token')||'',
                root:localStorage.getItem('root')||''
            }
         }
     },
     actions:{
        setLoginInfo(token:any,root:any){
            localStorage.setItem("token",token);
            this.user.token=token;
             localStorage.setItem("root",root);
            this.user.root=root;
        }
     }
})