import {BrowserWindow, session} from "electron";
import {taskConfig} from "@main/services/tasks/config";
import config from "@config/index";
import {getPreloadFile} from "@main/config/static-path";
import axios from "axios";
import querystring from "node:querystring";
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 3600})

export const onWechatVideoAuthorization = async (data) => {
  let tag = 'persite:wechat_video:session_tag:' + data.session_tag;
  let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = user_agent;
    callback({requestHeaders: details.requestHeaders});
  });
  let sessionData = session.fromPartition(tag, {
    cache: true
  });


  if (data.client_id) await taskConfig.tools.restoreWechatVideoCookies(sessionData, data);
  const childWin = new BrowserWindow({
    titleBarStyle: config.IsUseSysTitle ? "default" : "hidden",
    height: taskConfig.window.height,
    useContentSize: true,
    width: taskConfig.window.width,
    title: "微信视频号创作平台",
    autoHideMenuBar: true,
    minWidth: 842,
    frame: config.IsUseSysTitle,
    show: false,
    webPreferences: {
      session: sessionData,
      sandbox: false,
      webSecurity: true, // 禁用同源策略
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === "development",
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === "darwin",
      preload: getPreloadFile("wechat_video_authorization"),
      additionalArguments: ['--job-data', JSON.stringify(data)],
    },
  });

  // 开发模式下自动开启devtools
  if (process.env.NODE_ENV === "development") {
    childWin.webContents.openDevTools({mode: "undocked", activate: true});
  }
  let douyinCreativeUrl = taskConfig.url.creatorWechatVideoCom
  childWin.loadURL(douyinCreativeUrl, {userAgent: user_agent}).catch((err) => {
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
      platform_id: 4,
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

    // todo 虽然不知道有没有用  先加着再说
    if (data.client_id) {
      // 即在本地授权 又在本地使用 就直接加缓存了
      let cache_key = "needRestoreCookie_" + data.client_id;
      cache.set(cache_key, true)
    }
  });
}
