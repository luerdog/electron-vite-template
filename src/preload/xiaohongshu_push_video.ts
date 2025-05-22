import funcTool from "./funcTool";
import {taskConfig} from "@main/services/tasks/config";

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
// 设置封面
let setCover = async (jobData) => {
  let dom = getParentOfElementWithText('设置封面')
  dom.click();

  await waitForElement('#workspace')

  const workspace = document.getElementById('workspace');
  const inputs = Array.from(workspace.parentNode.children)
    .filter(el => el !== workspace && el.tagName === 'INPUT');

  let targetInput = inputs[0] as HTMLInputElement;

  // 3. 获取图片并伪造 File 对象
  try {
    let cover_url = jobData.cover_url;
    cover_url = cover_url.replace('http://', 'https://');
    // (1) 获取图片 Blob
    const response = await fetch(cover_url);
    const blob = await response.blob();
    await delay(1000);
    // (2) 创建 File 对象（模拟用户上传的文件）
    const file = new File([blob], 'fake-image.png', {type: blob.type});

    // (3) 创建 DataTransfer 模拟文件选择
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    await delay(1000);

    // (4) 注入到 input
    targetInput.files = dataTransfer.files;

    // (5) 触发 change 事件（某些组件依赖这个事件）
    const event = new Event('change', {bubbles: true});
    targetInput.dispatchEvent(event);
    await delay(1000);
    console.log('图片已成功注入 input', targetInput.files);
  } catch (error) {
    console.error('伪造图片失败:', error);
  }
  await delay(1000);

  let overDom = getParentOfElementWithText('确定')

  overDom.click()
  await waitForElementToDisappear('#workspace')
}
// 设置标题
let setTitle = async (jobData) => {
  let inputDoms = Array.from(document.querySelectorAll('input'))

  let input = inputDoms.find(dom => {
    return dom.placeholder == '填写标题会有更多赞哦～'
  });

  if (!input) return;

  let text = jobData.title;
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
// 设置描述
let setDescribe = async (jobData) => {
  const editor = document.querySelector('#quillEditor');
  const editable = editor.querySelector('[contenteditable="true"]') as HTMLElement;

  let text = jobData.describe;

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
    editable.firstElementChild.remove();

    // 保持焦点
    editable.focus();
  }
}
// 设置定时发布
let setForePush = async (jobData) => {
  let dom = getParentOfElementWithText('定时发布')
  await scrollToCreatorModal(dom);
  await delay(1000);
  dom.click();
  await delay(1500);

  let inputDom: HTMLInputElement = document.querySelector('input[placeholder="选择日期和时间"]');
  console.log(inputDom);
  inputDom.click()
  inputDom.focus()
  await delay(1500);

  // 设置定时
  inputDom.value = jobData.release_at;
  inputDom.setAttribute("value", jobData.release_at);
  console.log('定时器控件');
  console.log(inputDom);
  let events = ['input', 'change'];
  for (let event of events) {
    const e = new Event(event, {bubbles: true});
    inputDom.dispatchEvent(e);
  }

  await delay(2000);

  let quedingdom = getParentOfElementWithText('确定');
  quedingdom.click();
}

let submit = async (jobData) => {
  let submitText: null | string;
  if (jobData.is_fore_push == 'fore_push') submitText = '定时发布';
  else submitText = '发布';

  let bdoms = Array.from(document.getElementsByTagName('button'));
  let dom = null;
  for (let bdom of bdoms) {
    if (bdom.textContent == submitText) {
      dom = bdom;
      break;
    }
  }
  if (!dom) console.log('没找到发布按钮');
  dom.click();
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

  let dom = getParentOfElementWithText('发布笔记');
  dom.click()

  floatingBox.updateContent('正在上传视频')
  await delay(1000);
  await pushVideo(jobData);

  await waitForText("封面设置")

  floatingBox.updateContent('正在设置封面');
  await delay(1000);
  await setCover(jobData);

  floatingBox.updateContent('正在设置标题');
  await delay(1000);
  await setTitle(jobData);

  floatingBox.updateContent('正在设置描述');
  await delay(1000);
  await setDescribe(jobData);

  // todo 有心情写一下地址定位

  if (jobData.is_fore_push == 'fore_push') {
    floatingBox.updateContent('正在设置定时发布');
    await delay(1000);
    await setForePush(jobData);
  }

  floatingBox.updateContent('正在提交发布笔记');
  await delay(1000);
  await submit(jobData);

  // 更新任务状态
  await taskConfig.tools.changePushJobStatus(jobData.id)

  // 任务完成自动关闭窗口
  close();
}


window.onload = async () => {
  await runTask();
}
