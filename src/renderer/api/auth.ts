import request from "@renderer/utils/request";

export function getUserInfoData(user_token): Promise<any> {
  return request({
    method: "POST",
    url: '/api/user/auth/profile',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + user_token
    }
  });
}
