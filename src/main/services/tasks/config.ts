import axios from "axios";
import querystring from "node:querystring";

export const taskConfig = {
  window: {
    width: 1280,
    height: 900,
  },
  api: {
    getCookiesApi: 'http://doujia-api.luerdog.com/api/pc/get-cookies',// 获取用户的缓存数据
    synceCookiesApi: 'http://doujia-api.luerdog.com/api/pc/sync-cookies',// 上传用户的缓存数据
    getFirstJobByTaskApi: 'http://doujia-api.luerdog.com/api/user/push-jobs/get-first-job-by-task',// 获取首个可推送的视频
    changePushJobStatusApi: 'http://127.0.0.1:81/api/user/push-jobs/change-status',// 更新推送任务状态
    saveDouyinUserIdApi: 'http://doujia-api.luerdog.com/api/user/clients/save-douyin-user-id',// 获取并保存抖音用户id
    getPushJobsByReleaseAtApi: 'http://127.0.0.1:81/api/user/push-jobs/get-push-jobs-by-release-at',
  },
  url: {
    'creatorDouyinCom': 'https://creator.douyin.com',
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
    restoreCookies: async (sessionData, data) => {
      try {
        // 把cookies从云端拉下来
        const params = {
          client_id: data.client_id,
          platform_id: 1
        };
        let apiurl = 'http://doujia-api.luerdog.com/api/pc/get-cookies'
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
            if (!cookie.url) {
              cookie.url = 'https://creator.douyin.com/'
            }

            // 排除非本域
            if (cookie.domain.indexOf('douyin.com') == -1) continue;
            await sessionData.cookies.set(cookie);
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
