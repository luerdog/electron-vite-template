import log from "electron-log";
import {taskConfig} from "@main/services/tasks/config";
import axios from "axios";
import querystring from "node:querystring";
import funcTool from "./funcTool";

// 抖音创作平台绕过浏览器验证
let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.reload();
}

let script = []
document.addEventListener('mousedown', (event) => {
  const {clientX, clientY, button} = event;
  script.push({x: event.clientX, y: event.clientY, button: event.button});
  log.info(`Mouse click at (${clientX}, ${clientY}), button: ${button}`);
});

function getJobData() {
  const rawArgs = process.argv
  const dataIndex = rawArgs.indexOf('--job-data') + 1
  return JSON.parse(rawArgs[dataIndex])
}

let waitForText = funcTool.waitForText
let delay = funcTool.delay

let syncUserId = async () => {
  await waitForText('抖音号：')
  await delay(2000);


  let user_data_json = localStorage.getItem('__tea_cache_tokens_2906');
  if (!user_data_json) return

  let data = JSON.parse(user_data_json);
  let douyin_user_id = data.user_unique_id;

  let params = {
    ...getJobData(),
    douyin_user_id: douyin_user_id,
    fans_counts: document.getElementById('guide_home_fans').getElementsByTagName('span')[0].textContent,
    like_counts: document.getElementById('guide_home_following').getElementsByTagName('span')[0].textContent
  };

  let apiurl = taskConfig.api.saveDouyinUserIdApi;

  axios.post(apiurl, querystring.stringify(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 可添加其他请求头
      'User-Agent': 'NodeJS-SyncClient/1.0'
    }
  }).then(res => res.data).then(data => {
    console.log(data)
    if (data && data.code == 10000) alert('用户ID已同步,关闭窗口后就会自动保存登录缓存!');
    else alert('出问题了!')
  })
}

// 直到用户登录完成后获取用户的user_id 然后调用接口同步到数据库
window.onload = async function () {

  await syncUserId();
}
