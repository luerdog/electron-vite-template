export default {
  build: {
    // todo 修改为正式的更新资源存放地址
    hotPublishUrl: "http://douyin-pc-upload.dd",
    hotPublishConfigName: "update-config",
  },
  dev: {
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
  },
  DllFolder: "",
  HotUpdateFolder: "update",
  UseStartupChart: true,
  IsUseSysTitle: true,
};
