import {onDouyinPushVideo} from "@main/services/tasks/douyin-push-video-task";
import {onDouyinAuthorization} from "@main/services/tasks/douyin-authorization-task";

export const useTasks = () => {
  return {
    initTask: (data) => {
      switch (data.type) {
        case 'douyin_authorization':
          onDouyinAuthorization(data);
          break;
        case 'douyin_push_video':
          onDouyinPushVideo(data);
          break;
      }
    }
  }
}
