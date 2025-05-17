import Store from 'electron-store'
import {taskConfig} from "@main/services/tasks/config";
import NodeCache from "node-cache";
import {BrowserWindow, session} from "electron";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";

const store = new Store();
const cache = new NodeCache({stdTTL: 3600})

// 开启窗口 并使用脚本推送视频到抖音
let pushJobToDouyin = (job) => {
  let data = {client_id: job.client_id}
  let tag = 'douyin:client_id:' + data.client_id;
  console.log(tag);
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  // 判断sessionData中是否存在数据 如果存在 就不同步服务器的数据过来了
  let cache_key = "needRestoreCookie_" + job.client_id;
  let needRestoreCookies = cache.get(cache_key);
  if (!needRestoreCookies) {
    console.log('同步 ' + job.client.name + ' session')
    taskConfig.tools.restoreCookies(sessionData, data);
    cache.set(cache_key, true);
  }

  const childWin = new BrowserWindow({
    titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
    height: taskConfig.window.height,
    useContentSize: true,
    width: taskConfig.window.width,
    title: "抖音创作平台 " + job.push_task.title,
    autoHideMenuBar: true,
    minWidth: 842,
    frame: config.IsUseSysTitle,
    show: false,
    webPreferences: {
      session: sessionData,
      sandbox: false,
      webSecurity: false,
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === "development",
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === "darwin",
      preload: getPreloadFile("douyin_push_video"),
      additionalArguments: ['--job-data', JSON.stringify(job)],
    },
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  let douyinCreativeUrl = taskConfig.url.creatorDouyinCom
  childWin.loadURL(douyinCreativeUrl);
  childWin.once("ready-to-show", () => {
    childWin.show();
  });

  // 监听窗口的关闭事件  当关闭的时候  开始下一个job
  childWin.on('close', async () => {
  })
}

export const OnDouyinLoopPushJobTask = () => {
  let loopTime = 1 * 60 * 1000;
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
        console.log((new Date).toString() + "来活啦,兄弟们 开进程!")

        let job = data.data[0];
        switch (job.type) {
          // 判断如果是抖音任务,就进入抖音任务流程
          case 1:
            pushJobToDouyin(job)
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
