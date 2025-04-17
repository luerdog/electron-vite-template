// 抖音创作平台绕过浏览器验证
let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.reload();
}

async function scrollToCreatorModal(element: HTMLElement) {
  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  } catch (error) {
    // 备用方案（如果浏览器不支持平滑滚动）
    console.warn('平滑滚动不支持，使用普通滚动');
    // element.scrollIntoView();
  }

  await delay(500);
}

// 按时间堵塞
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 监听dom堵塞
/**
 * 异步阻塞等待，直到指定选择器的元素出现在DOM中
 * @param {string} selector - CSS选择器 (如 ".my-class" 或 "#my-id")
 * @param {number} [timeout=30000] - 超时时间(毫秒)，默认30秒
 * @param {number} [checkInterval=100] - 检查间隔(毫秒)，默认100ms
 * @returns {Promise<Element>} 返回解析为找到的元素的Promise
 * @throws {Error} 如果超时未找到元素
 */
function waitForElement(selector, timeout = 30000, checkInterval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    // 立即检查一次
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    // 设置定时器定期检查
    const interval = setInterval(async () => {
      const element = document.querySelector(selector);

      if (element) {
        clearInterval(interval);
        await delay(1000);
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(interval);
        reject(new Error(`等待元素 "${selector}" 超时 (${timeout}ms)`));
      }
    }, checkInterval);
  });
}

/**
 * 堵塞等待 直到指定元素消失
 * @param selector
 * @param checkInterval
 */
function waitForElementToDisappear(selector, checkInterval = 100) {
  return new Promise((resolve) => {
    function checkElement() {
      const element = document.querySelector(selector);
      if (!element) {
        resolve(element);
      } else {
        setTimeout(checkElement, checkInterval); // 每100毫秒检查一次
      }
    }

    checkElement();
  });
}

function changeTitle(text) {
  let inputDoms = Array.from(document.querySelectorAll('input'))

  let input = inputDoms.find(dom => {
    return dom.placeholder == '填写作品标题，为作品获得更多流量'
  });
  if (!input) return;

  // 获取原始描述符
  const descriptor = Object.getOwnPropertyDescriptor(
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


// 通过文本高效获取节点dom
function getParentOfElementWithText(text) {
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  while (treeWalker.nextNode()) {
    const textNode = treeWalker.currentNode;
    if (textNode.nodeValue.trim() === text) {
      // 返回文本节点的父元素
      return textNode.parentElement;
    }
  }

  return null;
}

async function changeArea(text) {
  // 获取组件 dom
  let dom = getParentOfElementWithText('输入地理位置')
  await scrollToCreatorModal(dom);

  // 模拟点击 出现下来菜单
  dom.click()

  // 获取原始描述符
  const descriptor = Object.getOwnPropertyDescriptor(
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

async function pushVideo() {
  // 1. 获取线上资源
  const response = await fetch('http://typora-sync.luerdog.com/cloudsync/2025_3_29.mp4');
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
async function timerSet(time) {
  // 获取定时发布按钮
  const btn = getParentOfElementWithText('定时发布')
  await scrollToCreatorModal(btn);
  btn.click()

  await delay(1000);
  console.log('开始触发时间组件!')

  let inputDom: HTMLInputElement = document.querySelector('input[placeholder="日期和时间"]');
  inputDom.click()
  inputDom.focus()

  // 设置定时
  inputDom.value = time;
  inputDom.setAttribute("value", time)

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

function getJobData() {
  const rawArgs = process.argv
  const dataIndex = rawArgs.indexOf('--job-data') + 1
  return JSON.parse(rawArgs[dataIndex])
}

async function runTask() {
  try {
    let jobData = getJobData();

    await waitForElement('#douyin-creator-master-side-upload-wrap')

    // 点击发布视频按钮
    let target = document.elementFromPoint(95, 95) as HTMLElement;
    target.click()

    await waitForElement('.container-drag-icon')

    //推送视频到组件
    await pushVideo();


    await waitForElement('.editor-kit-root-container')
    // 填写标题
    changeTitle(jobData.title)
    // 填写描述
    changeDescription(jobData.describe)

    // 设置地区
    await changeArea(jobData.location)

    // // 设置定时发布任务
    // window.scrollBy({
    //   top: 1000,
    //   behavior: 'smooth' // 可以是 'auto' 或 'smooth'
    // });
    if (jobData.is_timing == 1) {
      console.log('设置定时');
      await timerSet(jobData.push_time);
    }

    if (jobData.cover_url) {
      console.log('设置封面');
      // 设置封面
      await setCover(jobData.cover_url);
    }

    // 点击发布
    let submitKey = setInterval(async () => {
      // 右侧预览需要切换到视频预览才能监控
      let btn = getParentOfElementWithText('预览视频');
      btn.click();

      let video = document.querySelectorAll('video').length
      if (video) {

        clearInterval(submitKey)
        await submit()
        // todo 更新PushJob状态
        // todo 给main.js发送信息 可以进行下一个PushJob了
      }
    }, 100)
  } catch (err) {
    console.log(err);
  }
}

window.onload = async () => {
  await runTask();
}
