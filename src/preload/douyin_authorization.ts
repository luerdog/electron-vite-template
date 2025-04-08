import {contextBridge} from "electron";

// 抖音创作平台绕过浏览器验证
let douyin_has_shown = localStorage.getItem('douyin-creator-browser-check__has_shown')
if (!douyin_has_shown) {
  // 绕过浏览器检测
  localStorage.setItem('douyin-creator-browser-check__has_shown', 'true')
  location.href = location.href
}

