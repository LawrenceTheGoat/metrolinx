# 中文语音识别故障排除 / Chinese Speech Recognition Troubleshooting

## 🔧 常见问题解决方案 / Common Issues & Solutions

### 问题1: "No speech detected" 错误 / Issue 1: "No speech detected" Error

**症状 / Symptoms:**
- 说中文时显示 "No speech detected, resetting UI silently"
- 控制台显示无法识别语音
- 应用程序重置到初始状态

**解决方案 / Solutions:**

#### 1. 浏览器设置 / Browser Settings

**Chrome浏览器:**
1. 打开 Chrome 设置 → 隐私和安全 → 网站设置 → 麦克风
2. 确保 `http://localhost:8080` 被允许使用麦克风
3. 在地址栏点击麦克风图标，选择"始终允许"

**Safari浏览器:**
1. Safari → 偏好设置 → 网站 → 麦克风
2. 将 `localhost` 设置为"允许"

**Firefox浏览器:**
1. 地址栏左侧点击盾牌图标
2. 关闭"增强跟踪保护"
3. 允许麦克风访问

#### 2. 系统语言设置 / System Language Settings

**macOS:**
```bash
# 检查系统语言设置
defaults read -g AppleLanguages

# 添加中文支持
系统偏好设置 → 语言与地区 → 添加中文（简体）
```

**Windows:**
```
设置 → 时间和语言 → 语言 → 添加语言 → 中文（简体）
```

#### 3. 麦克风测试 / Microphone Test

**测试步骤:**
1. 打开浏览器开发者工具 (F12)
2. 转到控制台 (Console)
3. 按住语音按钮说话
4. 查看控制台输出

**正常输出应该显示:**
```
Speech recognition started for zh-CN
Got result for zh-CN: "联合站到金莺站" (confidence: 0.7)
Chinese phonetic pattern detected: "lian he"
```

### 问题2: 语音识别不准确 / Issue 2: Inaccurate Speech Recognition

**改进技巧 / Improvement Tips:**

#### 1. 发音建议 / Pronunciation Tips
- **清晰发音**: 每个字都要发音清楚
- **适中语速**: 不要说得太快或太慢
- **标准普通话**: 尽量使用标准普通话发音
- **避免方言**: 避免使用地方方言

#### 2. 环境优化 / Environment Optimization
- **安静环境**: 在安静的环境中使用
- **麦克风距离**: 保持麦克风距离嘴巴15-20厘米
- **避免噪音**: 关闭电视、音乐等背景噪音

#### 3. 语音模式 / Speech Patterns

**推荐说法 / Recommended Phrases:**
```
✅ 好的说法:
"联合站到金莺站"
"从联合站到金莺站"
"我要从联合站去金莺站"

❌ 避免说法:
"嗯...联合站...到...金莺站"
"联合站到金莺站，谢谢"
"请帮我查联合站到金莺站"
```

### 问题3: 混合语言识别 / Issue 3: Mixed Language Recognition

**最佳实践 / Best Practices:**

#### 1. 语言一致性 / Language Consistency
```
✅ 推荐:
"联合站到金莺站" (纯中文)
"Union station to Oriole station" (纯英文)

⚠️ 可以但不推荐:
"联合 station to 金莺 station" (混合)
```

#### 2. 设置语言偏好 / Set Language Preference
```
说 "中文" → 设置中文优先
说 "English" → 设置英文优先
```

## 🛠️ 高级故障排除 / Advanced Troubleshooting

### 开发者工具调试 / Developer Tools Debugging

#### 1. 打开控制台 / Open Console
```
Chrome/Firefox: F12 → Console
Safari: Cmd+Option+C
```

#### 2. 监控语音识别 / Monitor Speech Recognition
```javascript
// 在控制台中运行以测试语音识别
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('麦克风访问成功 / Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('麦克风访问失败 / Microphone access failed:', error);
  });
```

#### 3. 检查语音识别支持 / Check Speech Recognition Support
```javascript
// 检查浏览器支持
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('✅ 语音识别支持 / Speech recognition supported');
} else {
  console.log('❌ 语音识别不支持 / Speech recognition not supported');
}
```

### 网络和服务器问题 / Network & Server Issues

#### 1. 检查服务器状态 / Check Server Status
```bash
# 确保服务器正在运行
cd metrolinx-mobile-app
python3 -m http.server 8080

# 应该看到:
# Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

#### 2. 检查GTFS数据加载 / Check GTFS Data Loading
在浏览器中访问:
- http://localhost:8080/GO-GTFS/stops.txt
- http://localhost:8080/GO-GTFS/routes.txt

应该看到CSV格式的数据文件。

## 📱 移动设备特殊问题 / Mobile Device Specific Issues

### iOS Safari
```
问题: 语音识别在iOS上不工作
解决: 
1. 设置 → Safari → 麦克风 → 允许
2. 使用HTTPS连接（生产环境）
3. 确保iOS版本 ≥ 14.3
```

### Android Chrome
```
问题: 中文识别准确率低
解决:
1. 设置 → 应用 → Chrome → 权限 → 麦克风 → 允许
2. Google设置 → 搜索 → 语音 → 添加中文
3. 确保网络连接稳定
```

## 🔍 常见错误代码 / Common Error Codes

### 语音识别错误 / Speech Recognition Errors

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `no-speech` | 未检测到语音 | 检查麦克风，重新说话 |
| `audio-capture` | 音频捕获失败 | 检查麦克风权限 |
| `not-allowed` | 权限被拒绝 | 允许麦克风访问 |
| `network` | 网络错误 | 检查网络连接 |
| `service-not-allowed` | 服务不可用 | 尝试其他浏览器 |

### 应用程序错误 / Application Errors

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "Station not found" | 站名识别失败 | 使用标准站名或别名 |
| "Failed to fetch" | 网络请求失败 | 检查服务器状态 |
| "GTFS data not loaded" | 数据未加载 | 刷新页面重新加载 |

## 🎯 测试用例 / Test Cases

### 基础测试 / Basic Tests
```
1. 说 "联合站到金莺站"
   期望: 识别为中文，返回班次信息

2. 说 "Union station to Oriole station"  
   期望: 识别为英文，返回班次信息

3. 说 "中文"
   期望: 设置语言偏好为中文
```

### 高级测试 / Advanced Tests
```
1. 说 "市中心到士嘉堡"
   期望: 识别为 Union Station to Scarborough GO

2. 说 "机场到多伦多联合站"
   期望: 识别为 Pearson Airport to Union Station

3. 说 "奥罗拉的下一班火车"
   期望: 返回Aurora GO的发车时间
```

## 📞 获取帮助 / Getting Help

### 日志收集 / Log Collection
```javascript
// 在控制台运行以收集调试信息
console.log('浏览器:', navigator.userAgent);
console.log('语言:', navigator.language);
console.log('语音识别支持:', 'webkitSpeechRecognition' in window);
console.log('语音合成支持:', 'speechSynthesis' in window);
```

### 报告问题 / Report Issues
包含以下信息:
1. 浏览器类型和版本
2. 操作系统
3. 具体的语音输入
4. 控制台错误信息
5. 期望的结果

## 🚀 性能优化建议 / Performance Optimization Tips

### 1. 浏览器优化 / Browser Optimization
- 关闭不必要的标签页
- 清除浏览器缓存
- 禁用不必要的扩展程序

### 2. 系统优化 / System Optimization
- 确保充足的内存
- 关闭其他音频应用程序
- 使用有线网络连接

### 3. 语音优化 / Speech Optimization
- 使用高质量麦克风
- 在安静环境中使用
- 保持稳定的说话节奏

---

**记住**: 中文语音识别需要浏览器的在线服务支持。确保网络连接稳定，并允许必要的权限。

**Remember**: Chinese speech recognition requires browser online services. Ensure stable network connection and grant necessary permissions.
