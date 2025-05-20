// 抖音创作平台绕过浏览器验证
import {taskConfig} from "@main/services/tasks/config";
import funcTool from "./funcTool";

let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.reload();
}

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

function changeTitle(text) {
  let inputDoms = Array.from(document.querySelectorAll('input'))

  let input = inputDoms.find(dom => {
    return dom.placeholder == '填写作品标题，为作品获得更多流量'
  });
  if (!input) return;

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

async function changeArea(text) {
  // 获取组件 dom
  let dom = getParentOfElementWithText('输入地理位置')
  await scrollToCreatorModal(dom);

  // 模拟点击 出现下来菜单
  dom.click()

  // 获取原始描述符
  let descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );
  // 获取input dom
  let nextSibling = dom.nextSibling as HTMLElement;
  let inputDom = nextSibling.querySelector('input')
  Object.defineProperty(inputDom, 'value', {
    ...descriptor,
    get: function () {
      return text;
    },
    set: function () {
    } // 阻止外部修改
  });

  // 设置地区
  inputDom.value = text
  inputDom.setAttribute("value", text)

  const event = new Event('input', {bubbles: true});
  inputDom.dispatchEvent(event);

  await delay(500);
  await waitForElement('.semi-select-option-list');

  let listDom = document.querySelector('.semi-select-option-list')
  await delay(1500);
  let listDomFirstChild = listDom.firstElementChild as HTMLElement;
  listDomFirstChild.click()

  await waitForElementToDisappear('.semi-select-option-list');
}

function changeDescription(text) {
  const editor = document.querySelector('.editor-kit-editor-container');
  const editable = editor.querySelector('[contenteditable="true"]') as HTMLElement;

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

async function pushVideo(jobData) {
  // 1. 获取线上资源
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

  // 5. 赋值给文件输入框
  // 找到包含指定文本的div元素
  const targetDiv = Array.from(document.querySelectorAll('div')).find(div => {
    return div.textContent.trim() === '点击上传 或直接将视频文件拖入此区域';
  });

  if (targetDiv) {
    // 获取父div
    const parentDiv = targetDiv.parentElement;
    // 在父div的兄弟节点中查找input元素
    const inputDom = parentDiv.parentElement.querySelector('input');

    inputDom.files = dataTransfer.files;

    // 6. 触发变更事件
    inputDom.dispatchEvent(new Event('change', {bubbles: true}));
  }
}

// 设置定时发布
async function timerSet(jobData) {
  // 获取定时发布按钮
  const btn = getParentOfElementWithText('定时发布')
  await scrollToCreatorModal(btn);
  btn.click()

  await delay(1000);
  console.log('开始触发时间组件!')

  let inputDom: HTMLInputElement = document.querySelector('input[placeholder="日期和时间"]');
  inputDom.click()
  inputDom.focus()
  await delay(1500);

  inputDom.value = jobData.release_at;
  let descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );

  Object.defineProperty(inputDom, 'value', {
    ...descriptor,
    get: function () {
      return jobData.release_at;
    },
    set: function () {
    } // 阻止外部修改
  });
  await delay(1500);

  // 设置定时
  inputDom.value = jobData.release_at;
  inputDom.setAttribute("value", jobData.release_at);
  await delay(2000);
  console.log('定时器控件');
  console.log(inputDom);

  const event = new Event('input', {bubbles: true});
  inputDom.dispatchEvent(event);
}

async function setCover(imageUrl: string) {
  let dom = getParentOfElementWithText('选择封面')
  if (!dom) {
    dom = getParentOfElementWithText('立即修改')
  }
  await scrollToCreatorModal(dom.parentElement);
  dom.click();

  // 等待dy-creator-content-modal-body出现
  await waitForElement('.dy-creator-content-modal')

  // 1. 目标 input 选择器（根据你的实际情况调整）
  const targetInput: HTMLInputElement = document.querySelector('.semi-upload-hidden-input');


  // 3. 获取图片并伪造 File 对象
  try {
    // (1) 获取图片 Blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // (2) 创建 File 对象（模拟用户上传的文件）
    const file = new File([blob], 'fake-image.png', {type: blob.type});

    // (3) 创建 DataTransfer 模拟文件选择
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // (4) 注入到 input
    targetInput.files = dataTransfer.files;

    // (5) 触发 change 事件（某些组件依赖这个事件）
    const event = new Event('change', {bubbles: true});
    targetInput.dispatchEvent(event);

    console.log('图片已成功注入 input', targetInput.files);
  } catch (error) {
    console.error('伪造图片失败:', error);
  }
  await delay(2000);

  let overDom = getParentOfElementWithText('完成')

  overDom.click()
  await waitForElementToDisappear('.dy-creator-content-modal')
}

async function submit() {
  await delay(1000);
  let dom = getParentOfElementWithText('发布')
  await scrollToCreatorModal(dom);
  dom.click()
}


async function runTask() {
  let jobData = getJobData();
  // 初始化悬浮框
  const floatingBox = createFloatingBox('初始内容');

  try {
    floatingBox.updateContent('正在获取推送任务数据!');
    await delay(2000);
    // 判断是否是登录状态 不是的话 直接关闭
    if (hasText('扫码登录')) {
      console.log("抖音号:" + jobData.client.name + "授权可能过期了,前往授权页面查看/重新授权!");
      close();
    }

    await waitForElement('#douyin-creator-master-side-upload-wrap')


    floatingBox.updateContent("点击发布视频");
    // 点击发布视频按钮
    let target = document.elementFromPoint(95, 95) as HTMLElement;
    target.click()

    await waitForElement('.container-drag-icon')

    floatingBox.updateContent('正在上传视频')
    //推送视频到组件
    await pushVideo(jobData);


    await waitForElement('.editor-kit-root-container')
    floatingBox.updateContent('正在设置标题')
    await delay(1000);
    // 填写标题
    changeTitle(jobData.title)
    floatingBox.updateContent('正在设置描述')
    await delay(1000);
    // 填写描述
    changeDescription(jobData.describe)

    if (jobData.location) {
      floatingBox.updateContent('正在设置地区定位')
      // 设置地区
      await changeArea(jobData.location)
    }

    if (jobData.is_fore_push == 'fore_push') {
      floatingBox.updateContent('正在设置定时发布')
      await timerSet(jobData);
    }

    if (jobData.cover_url) {
      floatingBox.updateContent('正在设置封面图')
      // 设置封面
      await setCover(jobData.cover_url);
    }

    // 点击发布
    let submitKey = setInterval(async () => {
      floatingBox.updateContent('正在等待视频上传完毕')
      // 右侧预览需要切换到视频预览才能监控
      let btn = getParentOfElementWithText('预览视频');
      btn.click();

      let video = document.querySelectorAll('video').length
      if (video) {
        floatingBox.updateContent('视频上传完毕,即将发布')
        clearInterval(submitKey)
        await submit()

        await delay(2000);

        // 需要等待作品列表出现
        await waitForText('作品管理')

        // todo 等待第一个作品的标题是否是发布的标题
        await taskConfig.tools.changePushJobStatus(jobData.id)

        await delay(1000);
        close();
      }
    }, 100)
  } catch (err) {
    console.log(err);
  }
}

window.onload = async () => {
  await runTask();
}
