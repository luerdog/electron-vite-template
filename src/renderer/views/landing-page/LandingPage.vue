<template>
  <section id="landing-page">
    <div id="wrapper">
      <img id="logo" :src="logo" alt="electron-vue"/>
    </div>
    <div id="main">
      等待网页任务推送
    </div>
  </section>
</template>

<script setup lang="ts">
import logo from "@renderer/assets/task.png";
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
}

#wrapper {
  padding: 23px 20px;
  width: 30%;
}

#logo {
  height: auto;
  width: 60px;
  margin: 0 auto;
}

#main {
  width: 60%;
  font: 25px/1.5 "Source Sans Pro", sans-serif;
}
</style>
