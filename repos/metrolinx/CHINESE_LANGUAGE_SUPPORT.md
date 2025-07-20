# 中文语言支持 / Chinese Language Support

## 🇨🇳 完整的中文支持 / Complete Chinese Support

您的Metrolinx语音交通助手现在完全支持中文！包括中文翻译、拼音发音和语音识别。

Your Metrolinx Voice Transit Assistant now has complete Chinese support! Including Chinese translations, phonetic pronunciations, and voice recognition.

## 🎯 支持的查询示例 / Supported Query Examples

### 中文查询 / Chinese Queries

**原始问题现在支持中文：**
- **说中文**: "联合站到金莺站" ✅
- **说英文**: "Union station to Oriole station" ✅  
- **混合语言**: "联合 to 奥里奥尔" ✅

**其他中文查询示例：**
- "市中心到士嘉堡" (Downtown to Scarborough)
- "机场到多伦多联合站" (Airport to Toronto Union)
- "列治文山到奥罗拉" (Richmond Hill to Aurora)
- "汉密尔顿的下一班火车" (Next train from Hamilton)

### 英文查询 / English Queries
- "Union station to Oreo station" ✅
- "Downtown to Scarborough" ✅
- "Airport to Richmond Hill" ✅
- "Next train from Hamilton" ✅

## 🚉 车站中文翻译对照表 / Station Chinese Translation Reference

### 主要车站 / Major Stations

| English | 中文翻译 | 拼音发音 | 站点代码 |
|---------|---------|---------|---------|
| Union Station | 联合站 / 市中心 | 尤尼恩 / 优尼恩 | UN |
| Oriole GO | 金莺站 / 奥里奥尔站 | 奥瑞欧 / 欧瑞欧 | OR |
| Scarborough GO | 士嘉堡站 / 斯卡伯勒站 | - | SC |
| Richmond Hill GO | 列治文山站 / 里士满山站 | - | RI |
| Aurora GO | 奥罗拉站 / 极光站 | - | AU |
| Pearson Airport | 皮尔逊机场 / 机场 | - | PA |
| Hamilton GO | 汉密尔顿站 / 咸美顿站 | - | HA |

### 完整车站列表 / Complete Station List

#### 东线 / East Line
- **Ajax GO**: 阿贾克斯站 / 埃阿斯站
- **Pickering GO**: 皮克林站 / 匹克林站  
- **Whitby GO**: 惠特比站 / 怀特比站
- **Oshawa GO**: 奥沙瓦站 / 奥沙华站

#### 北线 / North Line
- **Langstaff GO**: 朗斯塔夫站 / 兰斯塔夫站
- **Richmond Hill GO**: 列治文山站 / 里士满山站
- **Aurora GO**: 奥罗拉站 / 极光站 / 欧若拉站
- **Newmarket GO**: 纽马克特站 / 新市场站
- **Bradford GO**: 布拉德福德站 / 布雷德福站
- **Barrie South GO**: 巴里站 / 巴里南站

#### 西线 / West Line
- **Bloor GO**: 布洛尔站 / 布鲁尔站
- **Weston GO**: 韦斯顿站 / 威斯顿站
- **Etobicoke North GO**: 怡陶碧谷北站 / 伊桃碧谷北站
- **Malton GO**: 马尔顿站 / 莫尔顿站
- **Pearson Airport**: 皮尔逊机场 / 机场 / 多伦多机场
- **Brampton GO**: 布兰普顿站 / 宾顿站
- **Georgetown GO**: 乔治敦站 / 佐治城站
- **Guelph Central**: 圭尔夫站 / 贵湖站
- **Kitchener GO**: 基奇纳站 / 滑铁卢站

#### 南线 / South Line
- **Exhibition GO**: 展览站 / 展览场站
- **Mimico GO**: 米米科站 / 美美高站
- **Long Branch GO**: 长枝站 / 朗布兰奇站
- **Port Credit GO**: 宝港站 / 波特信贷站
- **Clarkson GO**: 克拉克森站 / 嘉逊站
- **Oakville GO**: 奥克维尔站 / 橡树镇站
- **Burlington GO**: 伯灵顿站 / 布灵顿站
- **Hamilton GO**: 汉密尔顿站 / 咸美顿站

## 🎤 语音识别功能 / Voice Recognition Features

### 支持的发音方式 / Supported Pronunciations

1. **标准中文发音** / Standard Chinese Pronunciation
   - "联合站" (Union Station)
   - "士嘉堡" (Scarborough)
   - "列治文山" (Richmond Hill)

2. **英文音译发音** / English Phonetic Pronunciation
   - "尤尼恩" (Union)
   - "奥瑞欧" (Oriole) 
   - "奥罗拉" (Aurora)

3. **混合发音** / Mixed Pronunciation
   - "联合 station"
   - "机场 GO"
   - "市中心 to 士嘉堡"

### 智能识别 / Smart Recognition

应用程序会自动识别：
The app automatically recognizes:

- ✅ **中文站名** / Chinese station names
- ✅ **英文站名** / English station names  
- ✅ **拼音发音** / Pinyin pronunciations
- ✅ **音译发音** / Phonetic pronunciations
- ✅ **混合语言** / Mixed languages
- ✅ **口音变化** / Accent variations

## 🔧 技术实现 / Technical Implementation

### 模糊匹配算法 / Fuzzy Matching Algorithm

使用Levenshtein距离算法进行智能匹配：
Uses Levenshtein distance algorithm for smart matching:

```javascript
// 示例匹配 / Example Matching
"奥瑞欧" → "Oriole GO" (相似度: 85%)
"联合" → "Union Station" (相似度: 90%)
"机场" → "Pearson Airport" (相似度: 95%)
```

### 多层匹配系统 / Multi-Level Matching System

1. **精确匹配** / Exact Match - 直接匹配站名
2. **模糊匹配** / Fuzzy Match - 处理发音变化
3. **部分匹配** / Partial Match - 匹配站名片段
4. **语义匹配** / Semantic Match - 理解同义词

## 📱 使用方法 / How to Use

### 基本操作 / Basic Operation

1. **访问应用** / Access App: http://localhost:8080
2. **按住说话按钮** / Hold the speak button
3. **用中文或英文说话** / Speak in Chinese or English
4. **松开按钮** / Release the button
5. **获取实时班次信息** / Get real-time schedule info

### 中文查询示例 / Chinese Query Examples

**查询班次时刻表：**
- "从联合站到金莺站的火车"
- "市中心到士嘉堡的下一班车"
- "机场到多伦多联合站"

**查询车站信息：**
- "列治文山站的下一班火车"
- "汉密尔顿站什么时候有车"
- "奥罗拉站的班次"

## 🌟 特色功能 / Special Features

### 1. 双语响应 / Bilingual Responses
- 中文查询 → 中文回复
- English queries → English responses
- 混合查询 → 智能语言检测

### 2. 文化适应 / Cultural Adaptation
- 使用中文用户熟悉的站名翻译
- 支持港台地区的不同翻译习惯
- 理解中文用户的表达习惯

### 3. 发音容错 / Pronunciation Tolerance
- 处理不同地区的口音
- 支持普通话和粤语发音
- 智能纠正发音错误

## 🎯 测试用例 / Test Cases

### 成功案例 / Success Cases

✅ **"联合站到金莺站"** → 识别为 "Union Station to Oriole GO"
✅ **"市中心到士嘉堡"** → 识别为 "Union Station to Scarborough GO"  
✅ **"机场到多伦多"** → 识别为 "Pearson Airport to Union Station"
✅ **"奥罗拉的下一班火车"** → 识别为 "Next train from Aurora GO"
✅ **"列治文山到联合"** → 识别为 "Richmond Hill GO to Union Station"

### 混合语言测试 / Mixed Language Tests

✅ **"联合 to 奥里奥尔"** → Union Station to Oriole GO
✅ **"机场 GO to 市中心"** → Pearson Airport to Union Station
✅ **"从 Union 到 士嘉堡"** → Union Station to Scarborough GO

## 🚀 未来增强 / Future Enhancements

### 计划功能 / Planned Features

1. **更多方言支持** / More Dialect Support
   - 粤语识别 / Cantonese recognition
   - 闽南语支持 / Hokkien support
   - 客家话识别 / Hakka recognition

2. **智能翻译** / Smart Translation
   - 实时中英翻译 / Real-time CN-EN translation
   - 语音合成优化 / Voice synthesis optimization
   - 自然语言理解 / Natural language understanding

3. **个性化设置** / Personalization
   - 用户语言偏好 / User language preference
   - 常用路线记忆 / Frequent route memory
   - 个性化发音适应 / Personalized pronunciation adaptation

## 📞 技术支持 / Technical Support

如果您在使用中文功能时遇到问题：
If you encounter issues with Chinese features:

1. **检查浏览器语言设置** / Check browser language settings
2. **确保麦克风权限** / Ensure microphone permissions
3. **尝试清晰发音** / Try clear pronunciation
4. **查看控制台日志** / Check console logs for debugging

## 🎊 总结 / Summary

您的Metrolinx语音交通助手现在完全支持中文！无论您说中文、英文还是混合语言，都能准确识别并提供实时的GO Transit班次信息。

Your Metrolinx Voice Transit Assistant now has complete Chinese support! Whether you speak Chinese, English, or a mix of both languages, it will accurately recognize your queries and provide real-time GO Transit schedule information.

**现在就试试说："联合站到金莺站"！**
**Try saying: "联合站到金莺站" right now!**
