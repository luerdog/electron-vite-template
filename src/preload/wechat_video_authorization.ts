import funcTool from "./funcTool";
import {taskConfig} from "@main/services/tasks/config";

function getJobData() {
  const rawArgs = process.argv
  const dataIndex = rawArgs.indexOf('--job-data') + 1
  return JSON.parse(rawArgs[dataIndex])
}

window.onload = async () => {
  let jobData = getJobData();

  if (!jobData.client_id) {
    await funcTool.delay(2000);
    await funcTool.waitForElement('.finder-info');

    let userInfoDom = document.getElementsByClassName('finder-info')[0] as HTMLElement;

    let avatarDom = userInfoDom.getElementsByTagName('img')[0] as HTMLElement;
    let nameDom = userInfoDom.getElementsByClassName('finder-nickname')[0] as HTMLElement;
    let userIdDom = userInfoDom.getElementsByClassName('finder-uniq-id')[0] as HTMLElement;
    let videoCountsDom = userInfoDom.getElementsByClassName('finder-info-num')[0] as HTMLElement;
    let fansCountsDom = userInfoDom.getElementsByClassName('finder-info-num')[1] as HTMLElement;

    let saveData = {
      user_id: jobData.user_id,
      session_tag: jobData.session_tag,
      avatar: avatarDom.getAttribute('src'),
      name: nameDom.textContent,
      wechat_video_user_id: userIdDom.textContent,
      video_counts: videoCountsDom.textContent,
      fans_counts: fansCountsDom.textContent,
    };
    console.log(saveData);

    let data = await taskConfig.tools.saveWechatVideoClientInfo(saveData);
    if (data.status == 200) {
      alert('微信视频号数据已同步!');
      close();
    } else {
      alert('账号数据同步失败!')
      close();
    }

    return;
  }

  console.log('到此一游 逼事不干')
}
