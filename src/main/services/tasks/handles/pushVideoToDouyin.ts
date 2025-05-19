import {BrowserWindow, session} from "electron";
import {taskConfig} from "@main/services/tasks/config";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 3600})

let pushVideoToDouyin = async (job) => {
  let data = {client_id: job.client_id}
  let tag = 'douyin:client_id:' + data.client_id;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  // 判断sessionData中是否存在数据 如果存在 就不同步服务器的数据过来了
  let cache_key = "needRestoreCookie_" + job.client_id;
  let needRestoreCookies = cache.get(cache_key);
  if (!needRestoreCookies) {
    console.log('同步 ' + job.client.name + ' session')
    await taskConfig.tools.restoreDouyinCookies(sessionData, data);
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
  childWin.loadURL(douyinCreativeUrl).catch(error=>{
    console.log(error);
  });
  childWin.once("ready-to-show", () => {
    childWin.show();
  });

  // 监听窗口的关闭事件  当关闭的时候  开始下一个job
  childWin.on('close', async () => {
  })
}

export default pushVideoToDouyin
