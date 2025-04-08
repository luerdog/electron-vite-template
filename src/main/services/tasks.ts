import {app, session, BrowserWindow} from "electron";
import * as fs from "node:fs";
import {getPreloadFile, winURL} from "../config/static-path";
import config from "@config/index";


async function restoreCookies(sessionData, file) {
  try {
    const cookiesData = fs.readFileSync(file, 'utf8');
    const cookies = JSON.parse(cookiesData);
    for (const cookie of cookies) {
      if (!cookie.url) {
        cookie.url = 'https://creator.douyin.com/'
      }

      // 排除非本域
      if (cookie.domain.indexOf('douyin.com') == -1) continue;
      await sessionData.cookies.set(cookie);
    }
  } catch (error) {
    console.log(error)
    console.log('No saved cookies found');
  }
}


let OnDouyinAuthorization = (data) => {
  let sessionData = session.fromPartition('douyin:client_id:' + data.client_id, {
    cache: true
  });

  let dir = 'douyin_authorization_data'
  let filename = `cookies_${data.client_id}.json`
  let url = 'https://creator.douyin.com'
  // 初始化存放文件夹
  let fs = require('fs')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  let file = [dir, filename].join('/')

  // 在窗口加载前调用
  restoreCookies(sessionData, file);

  const childWin = new BrowserWindow({
    titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
    height: 950,
    useContentSize: true,
    width: 1920,
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
      preload: getPreloadFile("douyin_authorization"),
    },
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  childWin.loadURL(url);
  childWin.once("ready-to-show", () => {
    childWin.show();
  });

  childWin.on('close', async () => {
    const cookies = await sessionData.cookies.get({});
    const cookiesData = JSON.stringify(cookies);
    fs.writeFileSync(file, cookiesData);
  });
}

export const useTasks = () => {
  return {
    initTask: (data) => {
      switch (data.type) {
        case 'douyin_authorization':
          OnDouyinAuthorization(data);
          break;
        case 'douyin_push':
          break;
      }
    }
  }
}
