// 抖音创作平台绕过浏览器验证
let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.href = location.href
}


// 模拟点击发布视频按钮

setTimeout(async () => {
  const target = document.elementFromPoint(95, 95);
  target.click()

  setTimeout(async () => {
// 1. 获取线上资源
    const response = await fetch('http://xpxt.oss-cn-shanghai.aliyuncs.com/21ff8ba5-240e-4734-9abb-3475e802afb4/material/20250402/1743560519_67ec9f47c2843.mp4?Expires=1744167849&OSSAccessKeyId=LTAI5tLE232xbDz3AZ6spXhh&Signature=%2BiWjiXNKb18KGvnEL7y%2BaPiqGUQ%3D');
    if (!response.ok) throw new Error('网络请求失败');
// 2. 转换为 Blob
    const blob = await response.blob();

// 3. 创建 File 对象
    const file = new File([blob], 'custom-filename.jpg', {
      type: blob.type || 'image/jpeg'
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
      console.log(inputDom); // 输出找到的input元素


      inputDom.files = dataTransfer.files;

      // 6. 触发变更事件
      inputDom.dispatchEvent(new Event('change', {bubbles: true}));
    }
  }, 5000)
}, 10000)
