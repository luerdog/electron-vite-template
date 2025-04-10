// 抖音创作平台绕过浏览器验证
let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.reload();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log(descriptor);

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

function changeDescription(text) {
  const editor = document.querySelector('.editor-kit-editor-container');
  const editable = editor.querySelector('[contenteditable="true"]');

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
    editable.firstElementChild.remove();
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

async function runTask() {
  try {
    await delay(6000)

    const target = document.elementFromPoint(95, 95);
    target.click()

    await delay(4000)

    await pushVideo();

    await delay(2000)

    changeTitle('测试标题')
    changeDescription("#话题# 陆志洁 luerdog")
    // 填写标题
  } catch (err) {
    console.log(err);
  }
}

runTask();
