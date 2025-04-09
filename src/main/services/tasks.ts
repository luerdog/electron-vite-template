import {app, session, BrowserWindow} from "electron";
import * as fs from "node:fs";
import {getPreloadFile, winURL} from "../config/static-path";
import config from "@config/index";
import axios from "axios";
import * as querystring from "node:querystring";


async function restoreCookies(sessionData, data) {
  try {
    // 把cookies从云端拉下来
    const params = {
      client_id: data.client_id,
      platform_id: 1
    };
    let apiurl = 'http://doujia-api.luerdog.com/api/pc/get-cookies'
    // 发送请求
    axios.post(apiurl, querystring.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 可添加其他请求头
        'User-Agent': 'NodeJS-SyncClient/1.0'
      }
    }).then(async (response) => {
      const cookiesData = response.data.data.cookies;
      const cookies = JSON.parse(cookiesData);
      for (const cookie of cookies) {
        if (!cookie.url) {
          cookie.url = 'https://creator.douyin.com/'
        }

        // 排除非本域
        if (cookie.domain.indexOf('douyin.com') == -1) continue;
        await sessionData.cookies.set(cookie);
      }
    })
  } catch (error) {
    console.log(error)
  }
}


let OnDouyinAuthorization = (data) => {
  let tag = 'douyin:client_id:' + data.client_id;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  restoreCookies(sessionData, data);

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
  let douyinCreativeUrl = 'https://creator.douyin.com'
  childWin.loadURL(douyinCreativeUrl);
  childWin.once("ready-to-show", () => {
    childWin.show();
  });

  childWin.on('close', async () => {
    const cookies = await sessionData.cookies.get({});
    const cookiesData = JSON.stringify(cookies);

    // 把cookies同步到云端
    const params = {
      client_id: data.client_id,
      platform_id: 1,
      cookies: cookiesData
    };
    let apiurl = 'http://doujia-api.luerdog.com/api/pc/sync-cookies'
    // 发送请求
    axios.post(apiurl, querystring.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 可添加其他请求头
        'User-Agent': 'NodeJS-SyncClient/1.0'
      }
    })
  });
}

let OnDouyinPushVideo = (data) => {
  let tag = 'douyin:client_id:' + data.client_id;
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  // 在窗口加载前调用
  restoreCookies(sessionData, data);


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
      preload: getPreloadFile("douyin_push_video"),
    },
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  let douyinCreativeUrl = 'https://creator.douyin.com'
  childWin.loadURL(douyinCreativeUrl);
  childWin.once("ready-to-show", () => {
    childWin.show();
  });
}

export const useTasks = () => {
  return {
    initTask: (data) => {
      switch (data.type) {
        case 'douyin_authorization':
          OnDouyinAuthorization(data);
          break;
        case 'douyin_push_video':
          OnDouyinPushVideo(data);
          break;
      }
    }
  }
}
