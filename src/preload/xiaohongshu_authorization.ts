import funcTool from "./funcTool";
import {taskConfig} from "@main/services/tasks/config";

function getJobData() {
  const rawArgs = process.argv
  const dataIndex = rawArgs.indexOf('--job-data') + 1
  return JSON.parse(rawArgs[dataIndex])
}


window.onload = async (event) => {
  let jobData = getJobData();

  console.log(jobData);

  if (!jobData.client_id) {
    await funcTool.delay(2000);
    await funcTool.waitForText('发布笔记');

    let userJosn = localStorage.getItem('USER_INFO_FOR_BIZ');
    if (!userJosn) close();

    let doms = document.getElementsByClassName('numerical');

    let userData = JSON.parse(userJosn);
    let saveData = {
      user_id: jobData.user_id,
      session_tag: jobData.session_tag,
      name: userData.userName,
      avatar: userData.userAvatar,
      xiaohongshu_user_id: userData.userId,
      like_counts: doms[0].textContent,
      fans_counts: doms[1].textContent,
    }

    let data = await taskConfig.tools.saveXiaohongshuClientInfo(saveData);
    if (data && data.length > 0) {
      alert('小红书数据已同步');
      close();
    }
    return;
  }

  console.log('到此一游 逼事不干')
}
