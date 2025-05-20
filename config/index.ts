export default {
  build: {
    // todo 修改为正式的更新资源存放地址
    hotPublishUrl: "http://doujia-api.luerdog.com/update",
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
