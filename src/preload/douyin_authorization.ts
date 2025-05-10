import log from "electron-log";
import {taskConfig} from "@main/services/tasks/config";
import axios from "axios";
import querystring from "node:querystring";

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

/**
 * 等待页面上出现指定的文字
 * @param {string} text - 需要等待出现的文字
 * @param {Object} [options] - 配置选项
 * @param {number} [options.timeout=30000] - 超时时间（毫秒）
 * @param {boolean} [options.checkVisibility=false] - 是否检查文字可见性
 * @returns {Promise<void>} - 返回 Promise，文字出现时 resolve，超时 reject
 */
function waitForText(text, timeout = 30000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      // 检查整个文档中是否包含指定文本
      if (document.body.textContent.includes(text)) {
        resolve(text);
        return;
      }

      // 检查是否超时
      if (Date.now() - startTime > timeout) {
        reject(new Error(`等待文本"${text}"超时`));
        return;
      }

      // 继续检查
      setTimeout(check, interval);
    };

    // 开始检查
    check();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let syncUserSession = async() => {
  waitForText('抖音号：').then(function () {

  })
}

let syncUserId = async () => {
  waitForText('抖音号：').then(function () {
    let user_data_json = localStorage.getItem('__tea_cache_tokens_2906');
    if (!user_data_json) return

    let data = JSON.parse(user_data_json);
    let douyin_user_id = data.user_unique_id;


    let params = getJobData();
    params['douyin_user_id'] = douyin_user_id;

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
  })
}

// let syncUserInfo = async () => {
//   waitForText('抖音号：').then(function () {
//     let params = getJobData();
//
//     let
//   })
// }

// 直到用户登录完成后获取用户的user_id 然后调用接口同步到数据库
window.onload = async function () {
  await syncUserId();
}
