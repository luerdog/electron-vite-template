import {taskConfig} from "@main/services/tasks/config";
import {BrowserWindow, session} from "electron";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";

let oldJob = null;

let pushJobToDouyin = (job) => {
  let data = {client_id: job.push_task.client_id}
  let tag = 'douyin:client_id:' + data.client_id;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  taskConfig.tools.restoreCookies(sessionData, data);

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
    // todo 这里需要判断上一个任务是否提交api已经修改状态 给他10秒的时间
    let nextJob = await taskConfig.tools.getPushJobByPushTaskId(job.push_task.id);
    console.log(nextJob.id)
    console.log(oldJob.id)
    // todo nextJob.id 如果和oldJob.id一致 就再等等

    if (nextJob.id != oldJob.id) {
      oldJob = nextJob;
      pushJobToDouyin(nextJob)
    }
  })
}

export const onDouyinPushVideo = async (data) => {
  let job = await taskConfig.tools.getPushJobByPushTaskId(data.push_task_id);
  oldJob = job;
  pushJobToDouyin(job)
}
