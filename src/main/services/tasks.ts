import {onDouyinPushVideo} from "@main/services/tasks/douyin-push-video-task";
import {onDouyinAuthorization} from "@main/services/tasks/douyin-authorization-task";
import {onBindUser} from "@main/services/tasks/bind-user";
import {onLoopPushTaskController} from "@main/services/tasks/loop-push-task-controller-task";
import {onXiaohongshuAuthorization} from "@main/services/tasks/xiaohongshu-authorization-task";
import {onWechatVideoAuthorization} from "@main/services/tasks/wechat-video-authorization-task";
import log from "electron-log";

export const useTasks = () => {
  return {
    initTask: (data) => {
      switch (data.type) {
        // 抖音客户绑定授权
        case 'douyin_authorization':
          onDouyinAuthorization(data).catch((error) => {
            log.error(error);
          });
          break;
        // 小红书客户绑定授权
        case 'xiaohongshu_authorization':
          onXiaohongshuAuthorization(data).catch((error) => {
            log.error(error);
          });
          break;
        case 'wechat_video_authorization':
          onWechatVideoAuthorization(data).catch((error) => {
            log.error(error);
          });
          break;
        // 已弃用
        // case 'douyin_push_video':
        //   onDouyinPushVideo(data);
        //   break;
        // 员工绑定
        case 'bind_user':
          onBindUser(data)
          break;
        // 修改任务推送开关
        case 'loop_push_task_controller':
          onLoopPushTaskController(data);
          break;
      }
    }
  }
}
