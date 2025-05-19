import {BrowserWindow, session} from "electron";
import {taskConfig} from "@main/services/tasks/config";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 3600})

let pushVideoToXiaohongshu = async (job) => {
  let data = {client_id: job.client_id}
  let tag = 'xiaoshouhuo:session_tag:' + job.client.session_tag;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  // 判断sessionData中是否存在数据 如果存在 就不同步服务器的数据过来了
  let cache_key = "needRestoreCookie_" + job.client_id;
  let needRestoreCookies = cache.get(cache_key);
  if (!needRestoreCookies) {
    console.log('同步 ' + job.client.name + ' session')
    await taskConfig.tools.restoreXiaohongshuCookies(sessionData, data);
    cache.set(cache_key, true);
  }

  const childWin = new BrowserWindow({
    titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
    height: taskConfig.window.height,
    useContentSize: true,
    width: taskConfig.window.width,
    title: "小红书创作平台" + job.push_task.title,
    autoHideMenuBar: true,
    minWidth: 842,
    frame: config.IsUseSysTitle,
    show: false,
    webPreferences: {
      session: sessionData,
      sandbox: false,
      webSecurity: true,
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === "development",
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === "darwin",
      preload: getPreloadFile("xiaohongshu_push_video"),
      additionalArguments: ['--job-data', JSON.stringify(job)]
    },
  });
  childWin.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  let xiaohongshuCreativeUrl = taskConfig.url.creatorXiaohongshuCom
  childWin.loadURL(xiaohongshuCreativeUrl).catch((error) => {
    console.log("报错原因:" + error)
  });
  childWin.once("ready-to-show", () => {
    childWin.show();
  });

  // 监听窗口的关闭事件  当关闭的时候  开始下一个job
  childWin.on('close', async () => {
  })
}

export default pushVideoToXiaohongshu;
