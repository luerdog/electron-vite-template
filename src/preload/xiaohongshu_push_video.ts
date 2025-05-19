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
let pushVideo = async (jobData) => {
  await waitForElement('.upload-input')
  let video_url = jobData.video_url;
  // 这里需要把http://修改为https://
  video_url = video_url.replace('http://', 'https://');

  const response = await fetch(video_url);
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

  // 5. 赋值给文件输入框
  // 找到包含指定文本的div元素
  const targetDiv = Array.from(document.querySelectorAll('p')).find(div => {
    return div.textContent.trim() === '拖拽视频到此或点击上传';
  });

  if (targetDiv) {
    // 获取父div
    const parentDiv = targetDiv.parentElement;
    // 在父div的兄弟节点中查找input元素
    const inputDom = parentDiv.parentElement.querySelector('input');
    console.log(inputDom);

    inputDom.files = dataTransfer.files;
    let event = new Event('change', {bubbles: true});
    // 6. 触发变更事件
    inputDom.dispatchEvent(event);
  }
}

let runTask = async () => {
  // 初始化悬浮框
  const floatingBox = createFloatingBox('初始内容');
  // 解析任务数据
  let jobData = getJobData();

  floatingBox.updateContent('正在获取推送任务数据!');

  await delay(2000);

  // 判断是否是登录状态 不是的话 直接关闭
  if (hasText('短信登录')) {
    alert("小红书号:" + jobData.client.name + "授权可能过期了,前往授权页面查看/重新授权!");
    close();
  }

  await waitForText('发布笔记')
  floatingBox.updateContent("点击发布视频");

  let dom1 = getParentOfElementWithText('发布笔记');
  dom1.click()
  await delay(2000);
  let dom2 = getParentOfElementWithText('首页');
  dom2.click()
  await delay(2000);
  dom1.click()

  floatingBox.updateContent('正在上传视频')

  await pushVideo(jobData);

  console.log('进行下一步了')

  await delay(5000);
}


window.onload = async () => {
  await runTask();
}
