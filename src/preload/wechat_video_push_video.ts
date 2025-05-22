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

let getIframeBody = () => {
  let iframe = document.getElementsByClassName('wujie_iframe')[0];
  return iframe.shadowRoot.querySelector('body');
}

let pushVideo = async (jobData) => {
  let iframeBody = getIframeBody();
  let uploadDom = iframeBody.getElementsByClassName("post-upload-wrap")[0];
  let inputDom = uploadDom.getElementsByTagName('input')[0]

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

  inputDom.files = dataTransfer.files;
  let event = new Event('change', {bubbles: true});
  // 6. 触发变更事件
  inputDom.dispatchEvent(event);
}

let setDescribe = async (jobData) => {
  let text = jobData.describe;

  const editor = getIframeBody().querySelector('.post-desc-box') as HTMLElement;
  const editable = editor.querySelector('.input-editor') as HTMLElement;

  if (editable) {
    // 方法1B: 更真实的模拟输入（推荐）
    const textNode = document.createTextNode(text);
    const range = document.createRange();
    const selection = window.getSelection();

    // 设置插入位置（当前光标位置或末尾）
    range.selectNodeContents(editable);
    range.collapse(false); // false 表示插入到末尾

    // 插入内容
    range.insertNode(textNode);

    // 移动光标到插入内容之后
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);    // 触发输入事件


    const events = ['input', 'change', 'keydown', 'keyup', 'keypress'];
    events.forEach(eventType => {
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      editable.dispatchEvent(event);
      editor.dispatchEvent(event);
    });

    // 保持焦点
    editable.focus();
  }
}

let setTitle = async (jobData) => {
  let text = jobData.title;

  let inputs = Array.from(getIframeBody().getElementsByClassName('weui-desktop-form__input'));
  let input = null;
  for (let i of inputs) {
    if (i.getAttribute('placeholder') == '概括视频主要内容，字数建议6-16个字符') {
      input = i
    }
  }

  if (!input) return;

  input.value = text
  // 获取原始描述符
  let descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );

  // 重定义 value 属性
  Object.defineProperty(input, 'value', {
    ...descriptor,
    get: function () {
      return text;
    },
    set: function () {
    } // 阻止外部修改
  });

  // 更新 UI 显示
  input.setAttribute('value', text);
  input.value = text

  // 触发事件
  const event = new Event('input', {bubbles: true});
  input.dispatchEvent(event);
}

let runTask = async () => {
  let jobData = getJobData();
  await delay(3000);
  let loginDom = document.getElementsByClassName('platform-info')
  if (loginDom.length > 0) {
    alert('微信视频号扫码登录失效,重新前往扫码授权!')
    close();
  }

  let createVideoPageUrl = "https://channels.weixin.qq.com/platform/post/create";

  if (location.href != createVideoPageUrl) location.href = createVideoPageUrl;

  await delay(1000);

  await pushVideo(jobData);
  await delay(2000);

  await setTitle(jobData);
  await delay(2000);

  await setDescribe(jobData);
  await delay(2000);

  // await setCover(jobData);
  // await delay(2000);
}

window.onload = async () => {
  await runTask();
}
