import {taskConfig} from "@main/services/tasks/config";
import {BrowserWindow, session} from "electron";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";

export const onDouyinPushVideo = (data) => {
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
    title: "抖音创作平台",
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
}
