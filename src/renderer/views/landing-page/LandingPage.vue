<template>
  <section id="landing-page">
    <div id="user-info">
      <div v-if="user_avatar"><img class="company-avatar" :src="user_avatar"></div>
      <div v-if="user_name" class="text-area">{{ user_name }}</div>
    </div>
    <div id="task-info">
      <div id="wrapper">
        <img id="logo" :src="logo" alt="electron-vue"/>
      </div>
      <div id="main" class="text-area">
        <div v-if="is_loop">
          {{ msg }}
        </div>
        <div v-else>当前任务监听状态:关闭</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import logo from "@renderer/assets/task.png";
import {getUserInfoData} from "@renderer/api/auth"
import {ref} from "vue";

const {ipcRendererChannel} = window;
const getUserInfoSecond = 1000 * 60 * 60 * 6;

let msgText = "等待任务推送";
let haveNewPushTaskMsg = "有新任务,准备执行!"

let msg = ref(msgText);
let user_name = ref('等待用户授权')
let user_avatar = ref();
let is_loop = ref(false);

ipcRendererChannel.HaveNewPushTask.on(() => {
  msg.value = haveNewPushTaskMsg;
  setTimeout(() => {
    msg.value = msgText;
  }, 2500)
})

let getUserInfo = () => {
  let user_token = localStorage.getItem('user_token');
  if (!user_token) return;

  getUserInfoData(user_token).then(data => {
    console.log(data)
    user_name.value = data.data.name;
    user_avatar.value = data.data.avatar;
  })
}

getUserInfo();
// 每隔六小时刷新一次授权用户信息
setInterval(getUserInfo, getUserInfoSecond);

let getLoopStatus = () => {
  let status = localStorage.getItem('is_loop');
  if (!status) {
    is_loop.value = false;
    return;
  }

  if (status == 'not_loop') {
    is_loop.value = false
    return;
  }

  is_loop.value = true;
}


ipcRendererChannel.SendUserToken.on((event, arg): void => {
  console.log(arg)
  localStorage.setItem('user_token', arg['user_token']);
  getUserInfo()
})

ipcRendererChannel.SyncLoopStatus.on((event, arg): void => {
  console.log(arg)
  localStorage.setItem('is_loop', arg['is_loop']);

  getLoopStatus()
})

</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.main {
  padding-top: 10px !important;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

.company-avatar, #logo {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 20%;
}

#user-info, #task-info {
  font: 14px/36px "Source Sans Pro", sans-serif;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-evenly;
}

#task-info {
  border-top: 2px dashed #ccc;
  padding-top: 12px;
}

.text-area {
  width: 200px
}
</style>
