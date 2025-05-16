import {BrowserWindow, dialog} from "electron";
import Store from 'electron-store'
import windowManager from "@main/services/window-manager";

const store = new Store()

export function onBindUser(data) {
  store.set('user_token', data.user_token);

  // 把user_token传递到渲染进程主窗口
  let mainWindow: BrowserWindow = (new windowManager()).mainWindow;
  if (!mainWindow) {
    mainWindow = BrowserWindow.getAllWindows()[0];
  }
  mainWindow.webContents.send("SendUserToken", {user_token: data.user_token});

  dialog.showMessageBoxSync({
    type: 'info',
    title: '员工授权绑定提示',
    message: '员工授权信息已经绑定成功!',
    buttons: ['确定']
  });
}
