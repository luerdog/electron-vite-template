<template>
  <section id="landing-page">
    <div id="wrapper">
      <img id="logo" :src="logo" alt="electron-vue"/>
    </div>
    <div id="main">
      {{ msg }}
    </div>
  </section>
</template>

<script setup lang="ts">
import logo from "@renderer/assets/task.png";
import {ref} from "vue";

const {ipcRendererChannel} = window;

let msgText = "等待网页任务推送";
let haveNewPushTaskMsg = "有新任务,准备执行!"

let msg = ref(msgText);

ipcRendererChannel.HaveNewPushTask.on((event, arg) => {
  msg.value = haveNewPushTaskMsg;
  setTimeout(() => {
    msg.value = msgText;
  }, 2500)
})
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#landing-page {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
}

#wrapper {
  padding: 5px;
  width: 30%;
}

#logo {
  height: auto;
  width: 30px;
  margin: 0 auto;
}

#main {
  width: 60%;
  font: 12px/1.4 "Source Sans Pro", sans-serif;
}
</style>
