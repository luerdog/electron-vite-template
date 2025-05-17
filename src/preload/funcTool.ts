let funcTool = {
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
  }
}

export default funcTool
