import axios from "axios";
import querystring from "node:querystring";

// let domain = 'http://127.0.0.1:81';
let domain = 'https://doujia-api.luerdog.com';

export const taskConfig = {
  window: {
    width: 1280,
    height: 900,
  },
  api: {
    getCookiesApi: domain + '/api/pc/get-cookies',// 获取用户的缓存数据
    synceCookiesApi: domain + '/api/pc/sync-cookies',// 上传用户的缓存数据
    getFirstJobByTaskApi: domain + '/api/user/push-jobs/get-first-job-by-task',// 获取首个可推送的视频
    changePushJobStatusApi: domain + '/api/user/push-jobs/change-status',// 更新推送任务状态
    saveDouyinUserIdApi: domain + '/api/user/clients/save-douyin-user-id',// 获取并保存抖音用户id
    getPushJobsByReleaseAtApi: domain + '/api/user/push-jobs/get-push-jobs-by-release-at',// 根据发布日期获取最近的一个推送子任务
    saveXiaohongshuClientInfoApi: domain + '/api/user/clients/save-xiaohongshu-client-info',
    saveWechatVideoClientInfoApi: domain + '/api/user/clients/save-wechat-video-client-info'
  },
  url: {
    'creatorDouyinCom': 'https://creator.douyin.com',
    'creatorXiaohongshuCom': 'https://creator.xiaohongshu.com',
    'creatorWechatVideoCom': 'https://channels.weixin.qq.com',
  },
  tools: {
    // 通过push-task-id从云端获取任务数据 一次吐出来一个
    getPushJobByPushTaskId: async (pushTaskId) => {
      try {
        let params = {
          push_task_id: pushTaskId,
          // 设置推送类型为PC软件推送
          push_type: 1
        }
        let res = await axios.post(taskConfig.api.getFirstJobByTaskApi, querystring.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 可添加其他请求头
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        })

        return res.data.data;
      } catch (error) {
        return false;
      }
    },
    saveWechatVideoClientInfo: async (WechatVideoClientInfo) => {
      try {
        let res = await fetch(taskConfig.api.saveWechatVideoClientInfoApi, {
          method: 'POST',                 // 请求方法
          headers: {
            'Content-Type': 'application/json', // 指定 JSON 格式
          },
          body: JSON.stringify(WechatVideoClientInfo)      // 将数据转为 JSON 字符串
        });
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    saveXiaohongshuClientInfo: async (xiaohongshuClientInfo) => {
      try {
        let res = await axios.post(taskConfig.api.saveXiaohongshuClientInfoApi, xiaohongshuClientInfo, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        })

        return res.data.data;
      } catch (error) {
        console.log(error);
      }
    },
    changePushJobStatus: async (jobId) => {
      try {
        let params = {
          'push_job_id': jobId
        }

        let res = await axios.put(taskConfig.api.changePushJobStatusApi, querystring.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        })
        return res.data.data
      } catch (error) {
        console.log(error);
      }
    },
    restoreWechatVideoCookies: async (sessionData, data) => {
      try {
        const params = {
          client_id: data.client_id,
          platform_id: 4,
        };

        let apiurl = taskConfig.api.getCookiesApi

        // 发送请求
        axios.post(apiurl, querystring.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 可添加其他请求头
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        }).then(async (response) => {
          if (!response.data.data) return;
          const cookiesData = response.data.data.cookies;

          const cookies = JSON.parse(cookiesData);
          for (const cookie of cookies) {
            try {
              cookie.url = taskConfig.url.creatorWechatVideoCom

              await sessionData.cookies.set(cookie);
            } catch (error) {
              console.error(error);
              continue;
            }
          }
        }).catch(error => {
          console.log(error);
        });
      } catch (error) {
        console.log(error);
      }
    },
    restoreXiaohongshuCookies: async (sessionData, data) => {
      try {
        const params = {
          client_id: data.client_id,
          platform_id: 3
        };

        let apiurl = taskConfig.api.getCookiesApi

        // 发送请求
        axios.post(apiurl, querystring.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 可添加其他请求头
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        }).then(async (response) => {
          if (!response.data.data) return;
          const cookiesData = response.data.data.cookies;

          const cookies = JSON.parse(cookiesData);
          for (const cookie of cookies) {
            try {
              if (!cookie.url) {
                cookie.url = taskConfig.url.creatorXiaohongshuCom
              }

              await sessionData.cookies.set(cookie);
            } catch (error) {
              console.error(error);
              continue;
            }
          }
        }).catch(error => {
          console.log(error);
        });
      } catch (error) {
        console.log(error)
      }
    },
    restoreDouyinCookies: async (sessionData, data) => {
      try {
        // 把cookies从云端拉下来
        const params = {
          client_id: data.client_id,
          platform_id: 1,
        };
        let apiurl = taskConfig.api.getCookiesApi
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
            try {
              if (!cookie.url) {
                // cookie.url = 'https://creator.douyin.com/'
                cookie.url = taskConfig.url.creatorDouyinCom
              }

              // 排除非本域
              // if (cookie.domain.indexOf('douyin.com') == -1) continue;
              await sessionData.cookies.set(cookie);
            } catch (error) {
              continue;
            }
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
