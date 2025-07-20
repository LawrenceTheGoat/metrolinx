#!/bin/bash

# 📱 Metrolinx Voice Assistant - Mobile Deployment Script
# This script prepares your app for mobile deployment

echo "🚂 Metrolinx Voice Assistant - Mobile Deployment"
echo "================================================"

# Create deployment directory
DEPLOY_DIR="metrolinx-mobile-app"
echo "📁 Creating deployment directory: $DEPLOY_DIR"

# Remove existing deployment directory if it exists
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
    echo "🗑️  Removed existing deployment directory"
fi

# Create new deployment directory
mkdir "$DEPLOY_DIR"

# Copy essential files for mobile deployment
echo "📋 Copying files for mobile deployment..."

# Core app files
cp index.html "$DEPLOY_DIR/"
cp app.js "$DEPLOY_DIR/"
cp speech-handler.js "$DEPLOY_DIR/"
cp metrolinx-api.js "$DEPLOY_DIR/"
cp styles.css "$DEPLOY_DIR/"

# PWA files
cp manifest.json "$DEPLOY_DIR/"

# Documentation
cp README.md "$DEPLOY_DIR/"
cp MOBILE_DEPLOYMENT_GUIDE.md "$DEPLOY_DIR/"

# Server files (for reference)
cp server.py "$DEPLOY_DIR/"
cp server.js "$DEPLOY_DIR/"

# Real data integration files (for future use)
cp real-metrolinx-api.js "$DEPLOY_DIR/"
cp backend-server.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp REAL_DATA_SETUP.md "$DEPLOY_DIR/"

# Create a simple deployment README
cat > "$DEPLOY_DIR/DEPLOY_README.md" << 'EOF'
# 🚀 Ready to Deploy!

This folder contains your complete Metrolinx Voice Assistant, ready for mobile deployment.

## Quick Deploy Options:

### 1. Netlify (Easiest)
1. Go to https://netlify.com
2. Sign up for free
3. Drag and drop this entire folder to Netlify
4. Get your URL and share with friends!

### 2. Vercel
1. Go to https://vercel.com
2. Sign up for free
3. Import this folder
4. Deploy and share!

### 3. GitHub Pages
1. Create GitHub repository
2. Upload these files
3. Enable GitHub Pages
4. Share the GitHub Pages URL

## Your App Features:
✅ Works on all mobile devices
✅ Bilingual (English & Chinese)
✅ Voice recognition
✅ Progressive Web App (installable)
✅ Professional Metrolinx branding

## Test Before Sharing:
1. Deploy to your chosen platform
2. Test on your phone
3. Try voice commands: "你好" or "Hello Metrolinx"
4. Share with friends!

Happy deploying! 🎉
EOF

# Create a simple user guide for friends
cat > "$DEPLOY_DIR/USER_GUIDE.md" << 'EOF'
# 🚂 Metrolinx Voice Assistant - User Guide

## How to Use (Share this with your friends!)

### Getting Started
1. **Open the app** in your phone browser
2. **Allow microphone access** when prompted
3. **Tap "Hold to Speak"** button

### Language Selection
- **For Chinese**: Say "你好" (ni hao)
- **For English**: Say "Hello Metrolinx"

### What You Can Ask
- **Schedules**: "When is the next train to Union Station?"
- **Delays**: "Are there any delays on GO Train?"
- **Routes**: "How do I get from Bloor to Kennedy?"
- **Fares**: "How much does a ticket cost?"

### Tips for Best Experience
- 🎤 **Speak clearly** and naturally
- 📶 **Use good internet** connection (WiFi preferred)
- 🔊 **Check volume** if you can't hear responses
- 📱 **Add to home screen** for quick access

### Install as App
- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen

### Troubleshooting
- **No microphone?** → Check browser permissions
- **No sound?** → Check phone volume and try headphones
- **App not loading?** → Check internet connection

Enjoy your voice-powered transit assistant! 🎉
EOF

# Create mobile-optimized index.html with better mobile features
cat > "$DEPLOY_DIR/mobile-index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Metrolinx Voice Assistant</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#00A04B">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Metrolinx Voice">
    
    <!-- Favicon and Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚂</text></svg>">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚂</text></svg>">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    
    <!-- Styles -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- Mobile-specific optimizations -->
    <style>
        /* Additional mobile optimizations */
        body {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }
        
        /* Prevent zoom on input focus */
        input, select, textarea {
            font-size: 16px;
        }
        
        /* Better mobile button */
        .voice-button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            user-select: none;
        }
        
        /* Mobile-specific loading indicator */
        .mobile-loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 160, 75, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            display: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <!-- Mobile loading indicator -->
    <div class="mobile-loading" id="mobileLoading">
        <div>🎤 Listening...</div>
    </div>
    
    <!-- Main App Container -->
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="logo">🚂</div>
            <h1>METROLINX</h1>
            <h2>Voice Transit Assistant</h2>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <div class="instruction">
                <p>Press and hold the button to speak</p>
            </div>

            <!-- Voice Button -->
            <div class="voice-control">
                <button id="voiceButton" class="voice-button">
                    <span class="mic-icon">🎤</span>
                    <span class="button-text">Hold to Speak</span>
                </button>
            </div>

            <!-- Status Display -->
            <div id="status" class="status"></div>

            <!-- Response Display -->
            <div id="response" class="response"></div>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <p>Supported: English • 中文</p>
            <p class="mobile-tip">💡 Add to home screen for quick access</p>
        </footer>
    </div>

    <!-- Scripts -->
    <script src="speech-handler.js"></script>
    <script src="metrolinx-api.js"></script>
    <script src="app.js"></script>
    
    <!-- Mobile-specific enhancements -->
    <script>
        // Mobile-specific optimizations
        document.addEventListener('DOMContentLoaded', function() {
            // Prevent zoom on double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function (event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
            
            // Show mobile loading indicator during voice recognition
            const mobileLoading = document.getElementById('mobileLoading');
            const originalStartListening = window.app?.speechHandler?.startListening;
            
            if (window.app?.speechHandler && originalStartListening) {
                window.app.speechHandler.startListening = async function() {
                    mobileLoading.style.display = 'block';
                    try {
                        const result = await originalStartListening.call(this);
                        return result;
                    } finally {
                        mobileLoading.style.display = 'none';
                    }
                };
            }
            
            // PWA install prompt
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install hint after 10 seconds
                setTimeout(() => {
                    if (deferredPrompt) {
                        const installHint = document.createElement('div');
                        installHint.innerHTML = '💡 Tip: Add this app to your home screen for quick access!';
                        installHint.style.cssText = `
                            position: fixed;
                            bottom: 20px;
                            left: 20px;
                            right: 20px;
                            background: #00A04B;
                            color: white;
                            padding: 15px;
                            border-radius: 10px;
                            text-align: center;
                            font-size: 14px;
                            z-index: 1000;
                            cursor: pointer;
                        `;
                        
                        installHint.addEventListener('click', async () => {
                            if (deferredPrompt) {
                                deferredPrompt.prompt();
                                const { outcome } = await deferredPrompt.userChoice;
                                console.log(`User response to install prompt: ${outcome}`);
                                deferredPrompt = null;
                            }
                            installHint.remove();
                        });
                        
                        document.body.appendChild(installHint);
                        
                        // Auto-hide after 10 seconds
                        setTimeout(() => {
                            if (installHint.parentNode) {
                                installHint.remove();
                            }
                        }, 10000);
                    }
                }, 10000);
            });
        });
    </script>
</body>
</html>
EOF

echo "✅ Files copied successfully!"
echo ""
echo "📱 Mobile deployment package ready!"
echo "📁 Location: ./$DEPLOY_DIR"
echo ""
echo "🚀 Next Steps:"
echo "1. Go to https://netlify.com (recommended)"
echo "2. Sign up for free account"
echo "3. Drag and drop the '$DEPLOY_DIR' folder"
echo "4. Get your URL and share with friends!"
echo ""
echo "📋 Alternative: Use mobile-index.html for enhanced mobile experience"
echo ""
echo "🎉 Your app is ready to share with the world!"
echo ""
echo "📖 Check MOBILE_DEPLOYMENT_GUIDE.md for detailed instructions"
echo "👥 Share USER_GUIDE.md with your friends"
