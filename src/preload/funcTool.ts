let funcTool = {
  createFloatingBox: (initialContent: string) => {
    // 检查是否已存在悬浮框
    if (document.getElementById('floating-box')) {
      console.warn('悬浮框已经存在');
      return;
    }

    // 创建悬浮框元素
    const floatingBox = document.createElement('div');
    floatingBox.id = 'floating-box';

    // 使用JS设置样式
    Object.assign(floatingBox.style, {
      position: 'fixed',
      top: '50%',
      right: '0',
      transform: 'translateY(-50%)',
      width: '200px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRight: 'none',
      borderTopLeftRadius: '5px',
      borderBottomLeftRadius: '5px',
      boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
      zIndex: '9999',
      transition: 'all 0.3s ease'
    });

    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '操作提示';
    Object.assign(title.style, {
      marginTop: '0',
      color: '#343a40',
      fontSize: '16px'
    });

    // 创建内容区域
    const content = document.createElement('div');
    content.id = 'floating-content';
    content.textContent = initialContent || '这是默认内容';
    Object.assign(content.style, {
      margin: '10px 0',
      color: '#495057',
      fontSize: '14px'
    });

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.title = '关闭';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '5px',
      right: '5px',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      color: '#6c757d',
      padding: '0',
      width: '20px',
      height: '20px',
      lineHeight: '20px'
    });

    // 组装元素
    floatingBox.appendChild(closeBtn);
    floatingBox.appendChild(title);
    floatingBox.appendChild(content);
    document.body.appendChild(floatingBox);

    // 添加关闭按钮事件
    closeBtn.addEventListener('click', function () {
      floatingBox.style.display = 'none';
    });

    // // 添加悬停效果
    // floatingBox.addEventListener('mouseenter', function () {
    //   floatingBox.style.right = '0';
    // });
    //
    // floatingBox.addEventListener('mouseleave', function () {
    //   floatingBox.style.right = '-170px';
    // });
    //
    // // 初始状态半隐藏
    // floatingBox.style.right = '-170px';

    // 返回更新内容的方法
    return {
      updateContent: function (newContent) {
        content.textContent = newContent;
      },
      updateHtmlContent: function (html) {
        content.innerHTML = html;
      },
      show: function () {
        floatingBox.style.display = 'block';
        floatingBox.style.right = '0';
      },
      hide: function () {
        floatingBox.style.display = 'none';
      },
      toggle: function () {
        if (floatingBox.style.display === 'none') {
          this.show();
        } else {
          this.hide();
        }
      }
    };
  },
  // 延时等待
  delay: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  // 等待指定文字
  waitForText: async (text, timeout = 30000, interval = 100) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const check = () => {
        // 检查整个文档中是否包含指定文本
        if (document.body.textContent.includes(text)) {
          resolve(text);
          return;
        }

        // 检查是否超时
        if (Date.now() - startTime > timeout) {
          reject(new Error(`等待文本"${text}"超时`));
          return;
        }

        // 继续检查
        setTimeout(check, interval);
      };

      // 开始检查
      check();
    });
  },
  getJobData: () => {
    const rawArgs = process.argv
    const dataIndex = rawArgs.indexOf('--job-data') + 1
    return JSON.parse(rawArgs[dataIndex])
  },
  scrollToCreatorModal: async (element: HTMLElement) => {
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

    await funcTool.delay(500);
  },
  waitForElement: (selector, timeout = 30000, checkInterval = 100) => {
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
          await funcTool.delay(1000);
          resolve(element);
        } else if (Date.now() - startTime >= timeout) {
          clearInterval(interval);
          reject(new Error(`等待元素 "${selector}" 超时 (${timeout}ms)`));
        }
      }, checkInterval);
    });
  },
  waitForElementToDisappear: (selector, checkInterval = 100) => {
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
  },
  // 通过文本获取dom
  getParentOfElementWithText: (text) => {
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
  },
  hasText: (text) => {
    return document.body.textContent.includes(text);
  },
  handleBeforeUnload: (event) => {
    event.preventDefault();
    event.returnValue = "";
  },
  canreload: () => {
    window.removeEventListener('beforeunload', funcTool.handleBeforeUnload);
  },
  cannotreload: () => {
    window.addEventListener('beforeunload', funcTool.handleBeforeUnload);
  }
}

export default funcTool
