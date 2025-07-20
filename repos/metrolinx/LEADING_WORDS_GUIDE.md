# 🗣️ Leading Words Guide - Voice Transit App

## 🎯 How to Set Your Language Preference

The app now supports **leading words** to automatically detect and set your preferred language!

### 🇺🇸 **English Leading Words**
Start your conversation with any of these words to set English mode:

- **"Hello"** - General greeting
- **"Hi"** - Casual greeting  
- **"Hey"** - Informal greeting
- **"Good morning"** - Morning greeting
- **"Good afternoon"** - Afternoon greeting
- **"Good evening"** - Evening greeting

**Example Usage:**
```
🎤 "Hello, what's the next train from Union Station to Oriole?"
🤖 "Hello! I'll now assist you in English. What transit information can I help you with?"
```

### 🇨🇳 **Chinese Leading Words**
Start your conversation with any of these words to set Chinese mode:

- **"你好"** (nǐ hǎo) - Hello
- **"您好"** (nín hǎo) - Formal hello
- **"早上好"** (zǎo shàng hǎo) - Good morning
- **"晚上好"** (wǎn shàng hǎo) - Good evening

**Example Usage:**
```
🎤 "你好，联合站到金莺站的下一班列车是什么时候？"
🤖 "你好！我现在会用中文为您服务。请问您需要查询什么交通信息？"
```

## 🔄 **How It Works**

### **Step 1: Set Language Preference**
- **First interaction**: Use a leading word to set your language
- The app will confirm your language choice
- Your preference is remembered for the session

### **Step 2: Ask Your Questions**
- After setting language preference, ask normal transit questions
- The app will continue using your preferred language
- No need to use leading words again

## 📝 **Usage Examples**

### **English Workflow**
1. 🎤 **"Hello"**
2. 🤖 **"Hello! I'll now assist you in English. What transit information can I help you with?"**
3. 🎤 **"What's the next train from Union Station to Oriole?"**
4. 🤖 **"The next train from Union Station to Oriole departs at 2:45 PM..."**

### **Chinese Workflow**
1. 🎤 **"你好"**
2. 🤖 **"你好！我现在会用中文为您服务。请问您需要查询什么交通信息？"**
3. 🎤 **"联合站到金莺站"**
4. 🤖 **"从Union Station到Oriole GO的下一班列车在2:45 PM出发..."**

## 🎯 **Benefits**

### **✅ Clear Language Detection**
- No ambiguity about which language you want to use
- Immediate confirmation of language preference
- Consistent experience throughout the session

### **✅ Natural Conversation**
- Start conversations naturally with greetings
- No need to remember special commands
- Works with common greeting patterns

### **✅ Flexible Recognition**
- Handles various pronunciations of Chinese greetings
- Supports both formal and informal English greetings
- Robust speech recognition for both languages

## 🔧 **Technical Details**

### **Language Priority System**
1. **Leading Word Detection**: Highest priority
2. **User Preference**: Set by leading words, persists for session
3. **Content Analysis**: Fallback language detection
4. **Default**: English if no clear indicators

### **Console Debugging**
The app shows detailed language detection in the browser console:
```
=== LANGUAGE DETECTION ===
Input text: "你好，联合站到金莺站"
✅ Chinese leading word detected: "你好"
Language preference set to Chinese
```

## 💡 **Tips for Best Results**

### **For English Users:**
- Start with "Hello" or "Hi" for best recognition
- Speak clearly and at normal pace
- Use common English transit terms

### **For Chinese Users:**
- Start with "你好" for most reliable detection
- Speak clearly in Mandarin
- The app handles misrecognized Chinese speech patterns

### **General Tips:**
- Hold the button while speaking
- Wait for the app to confirm your language preference
- Subsequent questions don't need leading words

## 🚀 **Ready to Try?**

1. **Open the app** at `http://localhost:8080`
2. **Press and hold** the voice button
3. **Say a leading word**: "Hello" or "你好"
4. **Wait for confirmation**
5. **Ask your transit question**

The app will now provide consistent, language-appropriate responses for your entire session!
