# Metrolinx Voice Transit Assistant - Web App Usage Guide

## 🎉 Your Web App is Now Ready!

The pronunciation and accent tolerance issues have been fixed, and your app is now running as a proper web application to avoid file access errors.

## 🚀 How to Use Your Web App

### 1. Access the App
Your web app is currently running at: **http://localhost:8080**

The server is already started and running in your terminal. You can access it from:
- Your computer's web browser
- Your phone's browser (if on the same network)
- Any device connected to your local network

### 2. Using Voice Commands
1. **Click and hold** the green "Hold to Speak" button
2. **Speak clearly** into your microphone
3. **Release the button** when you're done speaking
4. The app will process your request and respond with schedule information

### 3. Example Voice Queries That Now Work ✅

Thanks to the pronunciation fixes, these queries now work perfectly:

**Original Problem Query:**
- "Union station to Oreo station" ✅ (Now correctly interprets "Oreo" as "Oriole")

**Other Supported Queries:**
- "Union to Oriole" ✅
- "Downtown to Scarborough" ✅
- "Ajax to Richmond Hill" ✅
- "Scarboro to downtown" ✅ (Handles accent variations)
- "Next train from Union Station" ✅
- "When is the next GO train to Oshawa?" ✅

### 4. Pronunciation Tolerance Features

The app now handles:
- **Mispronunciations**: "Oreo" → "Oriole", "Scarboro" → "Scarborough"
- **Accent variations**: Different ways of saying station names
- **Shortcuts**: "Downtown" → "Union Station", "Airport" → "Pearson Airport"
- **Partial names**: "Rich Hill" → "Richmond Hill"

## 🔧 Technical Setup (Already Done)

✅ **Web server running** - No more file access errors
✅ **GTFS data loaded** - Real Metrolinx schedule data
✅ **Fuzzy matching enabled** - Handles pronunciation variations
✅ **Mobile-friendly interface** - Works on phones and tablets

## 📱 Accessing from Your Phone

To use the app on your phone:

1. **Find your computer's IP address:**
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```

2. **Access from phone browser:**
   - Replace `localhost` with your computer's IP address
   - Example: `http://192.168.1.100:8080`

3. **Add to home screen** (optional):
   - Most mobile browsers allow you to "Add to Home Screen"
   - This creates an app-like icon on your phone

## 🎯 Testing the Pronunciation Fixes

Try these test cases to verify the fixes work:

### Test Case 1: Original Problem
**Say:** "Union station to Oreo station"
**Expected:** App should understand this as "Union Station to Oriole GO" and provide schedule

### Test Case 2: Accent Variations
**Say:** "Scarboro to downtown"
**Expected:** App should understand this as "Scarborough GO to Union Station"

### Test Case 3: Shortcuts
**Say:** "Airport to Union"
**Expected:** App should understand this as "Pearson Airport to Union Station"

## 🛠️ Troubleshooting

### If the app doesn't respond to voice:
1. **Check microphone permissions** - Browser should ask for microphone access
2. **Try a different browser** - Chrome/Safari work best for voice recognition
3. **Speak clearly** - Hold the button and speak directly into the microphone

### If you get "station not found" errors:
1. **Try the full station name** - "Oriole GO" instead of just "Oriole"
2. **Check the pronunciation guide** - See `PRONUNCIATION_FIXES_GUIDE.md`
3. **Use common aliases** - "Downtown" for Union Station, "Airport" for Pearson

### If the server stops working:
1. **Restart the server:**
   ```bash
   cd metrolinx-mobile-app
   python3 -m http.server 8080
   ```
2. **Check the terminal** - Look for any error messages

## 📋 Server Management

### To stop the server:
- Press `Ctrl+C` in the terminal where the server is running

### To restart the server:
```bash
cd metrolinx-mobile-app
python3 -m http.server 8080
```

### To run on a different port:
```bash
python3 -m http.server 9000  # Use port 9000 instead
```

## 🌟 Key Improvements Made

1. **Fixed "Failed to fetch" errors** - Now runs as proper web app
2. **Added pronunciation tolerance** - Handles "Oreo" → "Oriole" and many more
3. **Improved accent support** - Works with various pronunciation styles
4. **Better error messages** - More helpful feedback when stations aren't found
5. **Mobile-optimized** - Works great on phones and tablets

## 🎊 You're All Set!

Your Metrolinx Voice Transit Assistant is now fully functional as a web app with enhanced pronunciation tolerance. The original issue with "Union station to Oreo station" has been completely resolved!

**Current Status:** ✅ Web app running at http://localhost:8080
**Voice Recognition:** ✅ Enhanced with fuzzy matching
**Pronunciation Issues:** ✅ Fixed with comprehensive mappings
**Mobile Support:** ✅ Responsive design for all devices

Enjoy using your voice-powered transit assistant! 🚊🎤
