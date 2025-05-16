import Store from 'electron-store'
import {BrowserWindow, dialog} from "electron";
import windowManager from "@main/services/window-manager";

const store = new Store();

export function onLoopPushTaskController(data) {
  store.set("is_loop", data.is_loop_push_task);
  console.log(data);

  // 把user_token传递到渲染进程主窗口
  let mainWindow: BrowserWindow = (new windowManager()).mainWindow;
  if (!mainWindow) {
    mainWindow = BrowserWindow.getAllWindows()[0];
  }
  mainWindow.webContents.send("SyncLoopStatus", {is_loop: data.is_loop_push_task});

  dialog.showMessageBoxSync({
    type: 'info',
    title: '软件监听推送任务状态',
    message: '当前状态:' + (data.is_loop_push_task == 'loop' ? '开启' : '关闭'),
    buttons: ['确定']
  });
}
