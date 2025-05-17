import {taskConfig} from "@main/services/tasks/config";
import {BrowserWindow, session} from "electron";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";
import NodeCache from "node-cache";

let oldJob = null;
let tryItAgainCount = 0;

const cache = new NodeCache({stdTTL: 3600})

let pushJobToDouyin = (job) => {
  let data = {client_id: job.client_id}
  let tag = 'douyin:client_id:' + data.client_id;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  // todo 判断sessionData中是否存在数据 如果存在 就不同步服务器的数据过来了
  let needRestoreCookies = cache.get("needRestoreCookie");
  if (!needRestoreCookies) {
    console.log('同步session')
    taskConfig.tools.restoreDouyinCookies(sessionData, data);
    cache.set("needRestoreCookie", true);
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
    // 如果oldJob不是定时推送任务 就不继续执行了
    if (oldJob.is_timing != 1) {
      console.log("不是定时发布任务,所以只推送一条!");
      return;
    }

    try {
      // todo 这里需要判断上一个任务是否提交api已经修改状态 给他10秒的时间
      let nextJob = await taskConfig.tools.getPushJobByPushTaskId(job.push_task.id);
      if (!nextJob) {
        console.log('任务全部完成!')
        return;
      }
      console.log(nextJob.id)
      console.log(oldJob.id)

      if (nextJob.id != oldJob.id) {
        tryItAgainCount = 0;
        oldJob = nextJob;
        pushJobToDouyin(nextJob)
      }

      // nextJob.id 如果和oldJob.id一致 就重试 重试三次
      if (tryItAgainCount <= 2) {
        // 重试三次
        tryItAgainCount++;
        pushJobToDouyin(nextJob);
      }
    } catch (err) {
      console.log("任务结束!");
      console.log(err);
    }
  })
}

export const onDouyinPushVideo = async (data) => {
  let job = await taskConfig.tools.getPushJobByPushTaskId(data.push_task_id);
  if (!job) {
    console.log('没有可以推送的任务!')
    return;
  }
  oldJob = job;
  pushJobToDouyin(job)
}
