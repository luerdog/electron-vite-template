import {app, BrowserWindow, Notification} from "electron";
import log from "electron-log";
import path from "node:path/win32";
import * as url from "node:url";
import * as querystring from "node:querystring";
import windowManager from "@main/services/window-manager";
import {useTasks} from "@main/services/tasks";

const agreementName = 'legume';
let winFocus = () => {
  // 主窗口聚焦
  let mainWindow: BrowserWindow = (new windowManager()).mainWindow;
  if (!mainWindow) {
    mainWindow = BrowserWindow.getAllWindows()[0];
  }
  mainWindow.webContents.send("HaveNewPushTask");


  mainWindow.focus()
}
let parseData = (originalUrl) => {
  const parseUrl = url.parse(originalUrl);
  const queryData = querystring.parse(parseUrl.query);

  let data = {
    client_id: queryData.client_id || null,
    user_id: queryData.user_id || null,
    type: queryData.type || null,
  };

  return data;
}

export const useDeepLinks = () => {
  return {
    initDeepLinks: () => {
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient(agreementName, process.execPath, [path.resolve(process.argv[1])])
        }
      } else {
        app.setAsDefaultProtocolClient(agreementName)
      }

      const gotTheLock = app.requestSingleInstanceLock()

      if (!gotTheLock) {
        app.quit()
      } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
          // 主渲染进程获取焦点 切换提示
          winFocus();

          // 解析协议携带参数 判断任务类型
          let data = parseData(commandLine[commandLine.length - 1]);
          log.info(JSON.stringify(data));

          useTasks().initTask(data)
        })
      }
    }
  }
}
