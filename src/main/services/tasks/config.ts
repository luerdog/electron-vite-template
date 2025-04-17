import axios from "axios";
import querystring from "node:querystring";

export const taskConfig = {
  window: {
    width: 1280,
    height: 900,
  },
  api: {
    getCookiesApi: 'http://doujia-api.luerdog.com/api/pc/get-cookies',
    synceCookiesApi: 'http://doujia-api.luerdog.com/api/pc/sync-cookies',
    getFirstJobByTaskApi: 'http://doujia-api.luerdog.com/api/user/push-jobs/get-first-job-by-task',
    changePushJobStatusApi: 'http://doujia-api.luerdog.com/api/user/push-jobs/change-status'
  },
  url: {
    'creatorDouyinCom': 'https://creator.douyin.com',
  },
  tools: {
    // todo 通过push-task-id从云端获取任务数据 一次吐出来一个
    getPushJobByPushTaskId: async (pushTaskId) => {
      try {
        let params = {
          push_task_id: pushTaskId,
        }
        let res = await axios.post(taskConfig.api.getFirstJobByTaskApi, querystring.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 可添加其他请求头
            'User-Agent': 'NodeJS-SyncClient/1.0'
          }
        })

        return res.data.data
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
    // todo 更新PushJob状态
    refreshPushJobStatus: (pushJobId) => {
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
