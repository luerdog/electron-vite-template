import funcTool from "./funcTool";

// 创建悬浮框
let createFloatingBox = funcTool.createFloatingBox;
// 滑动到指定元素的位置
let scrollToCreatorModal = funcTool.scrollToCreatorModal;
// 按时间堵塞
let delay = funcTool.delay
// 堵塞等待指定元素出现
let waitForElement = funcTool.waitForElement;
// 堵塞等待指定元素消失
let waitForElementToDisappear = funcTool.waitForElementToDisappear;
// 通过文本高效获取节点dom
let getParentOfElementWithText = funcTool.getParentOfElementWithText;
// 获取任务的数据
let getJobData = funcTool.getJobData;
// 等待指定文字出现
let waitForText = funcTool.waitForText;
//  查询页面是否存在指定文字
let hasText = funcTool.hasText;

// 推送视频
let pushVideo = async () => {
  floatingBox.updateContent('正在上传视频')

  await waitForElement('.upload-input')

  const response = await fetch(jobData.video_url);
  if (!response.ok) throw new Error('网络请求失败');

  // 2. 转换为 Blob
  const blob = await response.blob();

  // 3. 创建 File 对象
  const file = new File([blob], 'video.mp4', {
    type: blob.type || 'video/mp4',
  });

  // 4. 创建 DataTransfer 对象
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  let uploadInputDom = document.getElementsByClassName('upload-input')[0] as HTMLInputElement;

  uploadInputDom.files = dataTransfer.files;

  // 6. 触发变更事件
  uploadInputDom.dispatchEvent(new Event('change', {bubbles: true}));
}

// 初始化悬浮框
const floatingBox = createFloatingBox('初始内容');

let jobData = getJobData();

let runTask = async () => {

  floatingBox.updateContent('正在获取推送任务数据!');

  await delay(2000);

  // 判断是否是登录状态 不是的话 直接关闭
  if (hasText('短信登录')) {
    console.log("小红书号:" + jobData.client.name + "授权可能过期了,前往授权页面查看/重新授权!");
    close();
  }

  await waitForText('发布笔记')
  floatingBox.updateContent("点击发布视频");

  let dom = getParentOfElementWithText('发布笔记');
  dom.click()


}


window.onload = async () => {
  await runTask();
}
