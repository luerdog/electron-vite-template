import Store from 'electron-store'
import {taskConfig} from "@main/services/tasks/config";
import pushVideoToDouyin from "@main/services/tasks/handles/pushVideoToDouyin";
import pushVideoToXiaohongshu from "@main/services/tasks/handles/pushVideoToXiaohongshu";

const store = new Store();

let loopMinutes = 1;

export const OnDouyinLoopPushJobTask = () => {
  let loopTime = loopMinutes * 1000 * 60;

  let func = async () => {
    // 控制是否开始监听任务循环
    let is_loop = store.get("is_loop");
    console.log("当前是否运行:" + is_loop);
    if (is_loop != 'loop') {
      console.log(new Date + '任务推送设置已关闭,无需开始循环')
      return;
    }

    let user_token = store.get("user_token");
    if (!user_token) {
      console.log(new Date + '没有授权,无需开始循环')
      return;
    }

    await fetch(taskConfig.api.getPushJobsByReleaseAtApi, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${user_token}`
      }
    }).then(res => res.json()).then(data => {
      if (data && data.data && data.data.length > 0) {
        // console.log((new Date).toString() + "来活啦,兄弟们 开进程!")

        let job = data.data[0];
        switch (job.type) {
          // 判断如果是抖音任务,就进入抖音任务流程
          case 1:
            pushVideoToDouyin(job)
            break;
          // 如果是小红书 就进入小红书的任务流程
          case 4:
            pushVideoToXiaohongshu(job);
            break;
          default:
            break;
        }
      }
    })
  }

  // 五秒后开始第一次查询
  setTimeout(func, 5000)
  // 开始循环
  setInterval(func, loopTime)
}
