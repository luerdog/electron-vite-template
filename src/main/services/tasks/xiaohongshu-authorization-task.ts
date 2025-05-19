import {BrowserWindow, session} from "electron";
import {taskConfig} from "@main/services/tasks/config";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";
import axios from "axios";
import querystring from "node:querystring";
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 3600})

export const onXiaohongshuAuthorization = async (data) => {
  let tag = 'persite:xiaoshouhuo:session_tag:' + data.session_tag;
  console.log(tag);
  let sessionData = session.fromPartition(tag, {
    cache: true
  });

  if (data.client_id) await taskConfig.tools.restoreXiaohongshuCookies(sessionData, data);

  const childWin = new BrowserWindow({
    titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
    height: taskConfig.window.height,
    useContentSize: true,
    width: taskConfig.window.width,
    title: "小红书创作平台",
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
      preload: getPreloadFile("xiaohongshu_authorization"),
      additionalArguments: ['--job-data', JSON.stringify(data)]
    },
  });
  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  let douyinCreativeUrl = taskConfig.url.creatorXiaohongshuCom
  childWin.loadURL(douyinCreativeUrl).catch((err) => {
  });
  childWin.once("ready-to-show", () => {
    childWin.show();
  });
  childWin.on('close', async () => {
    const cookies = await sessionData.cookies.get({});
    const cookiesData = JSON.stringify(cookies);

    // 把cookies同步到云端
    const params = {
      session_tag: data.session_tag,
      platform_id: 3,
      cookies: cookiesData
    };
    let apiurl = taskConfig.api.synceCookiesApi;
    // 发送请求
    await axios.post(apiurl, querystring.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 可添加其他请求头
        'User-Agent': 'NodeJS-SyncClient/1.0'
      }
    })

    // 即在本地授权 又在本地使用 就直接加缓存了
    let cache_key = "needRestoreCookie_" + data.client_id;
    cache.set(cache_key, true)
  });
}
