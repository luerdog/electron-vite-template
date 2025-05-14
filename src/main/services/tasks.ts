import {onDouyinPushVideo} from "@main/services/tasks/douyin-push-video-task";
import {onDouyinAuthorization} from "@main/services/tasks/douyin-authorization-task";
import {onBindUser} from "@main/services/tasks/bind-user";

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
        case 'bind_user':
          onBindUser(data)
          break;
      }
    }
  }
}
