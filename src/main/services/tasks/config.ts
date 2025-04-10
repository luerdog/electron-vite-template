import axios from "axios";
import querystring from "node:querystring";

export const taskConfig = {
  window: {
    width: 1280,
    height: 900,
  },
  api: {
    getCookiesApi: 'http://doujia-api.luerdog.com/api/pc/get-cookies',
    synceCookiesApi: 'http://doujia-api.luerdog.com/api/pc/sync-cookies'
  },
  url: {
    'creatorDouyinCom': 'https://creator.douyin.com',
  },
  tools: {
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
