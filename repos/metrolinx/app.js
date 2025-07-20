/**
 * Main Application Controller
 * Coordinates voice input, API queries, and speech output
 */

class VoiceTransitApp {
    constructor() {
        this.speechHandler = null;
        this.metrolinxAPI = null;
        this.isProcessing = false;
        this.currentResponse = null;
        this.isButtonPressed = false;
        this.recognitionTimeout = null;
        
        // DOM elements
        this.elements = {
            voiceButton: document.getElementById('voice-button'),
            statusText: document.getElementById('status-text'),
            languageIndicator: document.getElementById('language-indicator'),
            transcriptDisplay: document.getElementById('transcript-display'),
            transcriptText: document.getElementById('transcript-text'),
            detectedLanguage: document.getElementById('detected-language'),
            responseDisplay: document.getElementById('response-display'),
            responseText: document.getElementById('response-text'),
            pauseButton: document.getElementById('pause-button'),
            replayButton: document.getElementById('replay-button'),
            errorModal: document.getElementById('error-modal'),
            errorMessage: document.getElementById('error-message'),
            closeError: document.getElementById('close-error')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Stop any existing audio on page load/reload
            this.stopAllAudio();
            
            // Check browser support
            this.checkBrowserSupport();
            
            // Initialize components
            this.speechHandler = new SpeechHandler();
            this.metrolinxAPI = new MetrolinxAPI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Request microphone permission
            await this.requestPermissions();
            
            // Update status
            this.updateStatus('Hi! I\'m ready to help with your transit questions. Press and hold to speak');
            
            console.log('Voice Transit App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the app: ' + error.message);
        }
    }

    /**
     * Check if the browser supports required features
     */
    checkBrowserSupport() {
        const errors = [];
        
        if (!SpeechHandler.isSupported()) {
            errors.push('Speech recognition is not supported in this browser');
        }
        
        if (!SpeechHandler.isSpeechSynthesisSupported()) {
            errors.push('Text-to-speech is not supported in this browser');
        }
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            errors.push('Microphone access is not supported in this browser');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('. ') + '. Please use a modern browser like Chrome, Firefox, or Safari.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Track press and hold state
        this.pressStartTime = 0;
        this.isHolding = false;
        this.holdThreshold = 200; // 200ms to distinguish between click and hold
        
        // Track double-click for complete audio stop
        this.lastClickTime = 0;
        this.doubleClickThreshold = 300; // 300ms for double-click detection
        
        // Mouse events for desktop
        this.elements.voiceButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.pressStartTime = Date.now();
            this.isHolding = false;
            
            // Start voice input only if speech is not active
            if (!this.speechHandler.isSpeechActive()) {
                // Delay to distinguish between click and hold
                setTimeout(() => {
                    if (this.pressStartTime > 0) { // Still holding
                        this.isHolding = true;
                        this.startVoiceInput();
                    }
                }, this.holdThreshold);
            }
        });
        
        this.elements.voiceButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            const pressDuration = Date.now() - this.pressStartTime;
            this.pressStartTime = 0;
            
            if (this.isHolding) {
                // This was a hold - stop voice input
                this.isHolding = false;
                if (!this.speechHandler.isSpeechActive()) {
                    this.stopVoiceInput();
                }
            } else if (pressDuration < this.holdThreshold) {
                // This was a quick click - handle pause/resume
                this.handleButtonClick();
            }
        });
        
        this.elements.voiceButton.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            if (this.isHolding) {
                this.isHolding = false;
                this.pressStartTime = 0;
                if (!this.speechHandler.isSpeechActive()) {
                    this.stopVoiceInput();
                }
            }
        });
        
        // Touch events for mobile
        this.elements.voiceButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.pressStartTime = Date.now();
            this.isHolding = false;
            
            // Start voice input only if speech is not active
            if (!this.speechHandler.isSpeechActive()) {
                // Delay to distinguish between tap and hold
                setTimeout(() => {
                    if (this.pressStartTime > 0) { // Still holding
                        this.isHolding = true;
                        this.startVoiceInput();
                    }
                }, this.holdThreshold);
            }
        });
        
        this.elements.voiceButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            const pressDuration = Date.now() - this.pressStartTime;
            this.pressStartTime = 0;
            
            if (this.isHolding) {
                // This was a hold - stop voice input
                this.isHolding = false;
                if (!this.speechHandler.isSpeechActive()) {
                    this.stopVoiceInput();
                }
            } else if (pressDuration < this.holdThreshold) {
                // This was a quick tap - handle pause/resume
                this.handleButtonClick();
            }
        });
        
        this.elements.voiceButton.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (this.isHolding) {
                this.isHolding = false;
                this.pressStartTime = 0;
                if (!this.speechHandler.isSpeechActive()) {
                    this.stopVoiceInput();
                }
            }
        });
        
        // Replay button
        this.elements.replayButton.addEventListener('click', () => {
            this.replayResponse();
        });
        
        // Error modal
        this.elements.closeError.addEventListener('click', () => {
            this.hideError();
        });
        
        this.elements.errorModal.addEventListener('click', (e) => {
            if (e.target === this.elements.errorModal) {
                this.hideError();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isProcessing) {
                e.preventDefault();
                this.startVoiceInput();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.stopVoiceInput();
            }
        });
        
        // Set up interim result callback
        if (this.speechHandler) {
            this.speechHandler.onInterimResult = (text) => {
                this.showTranscript(text, null, true);
            };
        }
    }

    /**
     * Handle button click for pause/resume functionality and double-click for complete stop
     */
    handleButtonClick() {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - this.lastClickTime;
        
        // Check for double-click
        if (timeSinceLastClick < this.doubleClickThreshold) {
            // Double-click detected - completely stop audio
            this.stopAllAudio();
            this.updateStatus('Audio stopped. Press and hold to speak again');
            this.updateButtonState('default');
            console.log('Audio completely stopped by double-click');
            return;
        }
        
        this.lastClickTime = currentTime;
        
        // Only handle pause/resume if speech is currently active
        if (this.speechHandler.isSpeechActive()) {
            if (this.speechHandler.isSpeechPaused()) {
                // Resume speech
                if (this.speechHandler.resumeSpeech()) {
                    this.updateStatus('Speech resumed. Click to pause again, double-click to stop');
                    this.updateButtonState('pause');
                    console.log('Speech resumed by user click');
                }
            } else {
                // Pause speech
                if (this.speechHandler.pauseSpeech()) {
                    this.updateStatus('Speech paused. Click to resume, double-click to stop');
                    this.updateButtonState('continue');
                    console.log('Speech paused by user click');
                }
            }
        }
        // If no speech is active, ignore the click (don't trigger voice input)
        // Voice input is only triggered by press and hold
    }

    /**
     * Stop all audio output (for page reload and double-click functionality)
     */
    stopAllAudio() {
        try {
            // Set a flag to indicate we're intentionally stopping
            this.isIntentionalStop = true;
            
            // Stop speech synthesis
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                console.log('Speech synthesis stopped');
            }
            
            // Stop speech handler if it exists
            if (this.speechHandler) {
                this.speechHandler.stopSpeech();
                this.speechHandler.isSpeaking = false;
                this.speechHandler.isPaused = false;
                console.log('Speech handler stopped');
            }
            
            // Reset UI state
            this.isProcessing = false;
            this.resetUI();
            
            console.log('All audio stopped successfully');
            
            // Clear the flag after a short delay
            setTimeout(() => {
                this.isIntentionalStop = false;
            }, 100);
            
        } catch (error) {
            console.warn('Error stopping audio:', error);
        }
    }

    /**
     * Request necessary permissions
     */
    async requestPermissions() {
        try {
            const hasPermission = await this.speechHandler.requestMicrophonePermission();
            if (!hasPermission) {
                throw new Error('Microphone permission is required for voice input');
            }
        } catch (error) {
            console.warn('Permission request failed:', error);
            // Don't throw here, let the user try anyway
        }
    }

    /**
     * Start voice input
     */
    async startVoiceInput() {
        // Prevent multiple simultaneous attempts
        if (this.isProcessing || this.speechHandler.isListening || this.isButtonPressed) {
            console.log('Voice input already in progress, ignoring...');
            return;
        }

        this.isButtonPressed = true;

        try {
            // Clear any existing timeout
            if (this.recognitionTimeout) {
                clearTimeout(this.recognitionTimeout);
                this.recognitionTimeout = null;
            }

            // Update UI
            this.elements.voiceButton.classList.add('recording');
            this.updateStatus('Listening... Speak now');
            this.hideTranscript();
            this.hideResponse();
            
            // Start listening with proper error handling
            const result = await this.speechHandler.startListening();
            
            // Only process if we got a valid result
            if (result && result.transcript) {
                await this.processVoiceInput(result);
            } else {
                // Don't show error for no speech - just silently reset
                console.log('No speech detected, resetting UI silently');
                this.resetUI();
                this.updateStatus('No speech detected. Press and hold to try again');
            }
            
        } catch (error) {
            console.error('Voice input error:', error);
            
            // Only show errors for actual problems, not "no speech" scenarios
            if (!error.message.includes('already started') && 
                !error.message.includes('No speech detected') &&
                !error.message.includes('no-speech')) {
                this.showError(error.message);
            } else {
                // For "no speech" errors, just reset silently
                console.log('No speech error, resetting UI silently');
                this.resetUI();
                this.updateStatus('Ready! Press and hold to speak');
            }
        } finally {
            this.isButtonPressed = false;
        }
    }

    /**
     * Stop voice input
     */
    async stopVoiceInput() {
        this.isButtonPressed = false;
        
        // Clear any existing timeout
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        
        // Stop recognition if it's running
        if (this.speechHandler && this.speechHandler.isListening) {
            try {
                await this.speechHandler.stopListening();
            } catch (error) {
                console.warn('Error stopping recognition:', error);
            }
        }
        
        // Set a timeout to reset UI if needed
        this.recognitionTimeout = setTimeout(() => {
            if (!this.isProcessing) {
                this.resetUI();
                this.updateStatus('Ready! Press and hold to speak');
            }
        }, 500);
    }

    /**
     * Process voice input result
     */
    async processVoiceInput(result) {
        this.isProcessing = true;
        
        try {
            console.log('App Processing - Voice input result:', result);
            console.log('App Processing - Transcript:', result.transcript);
            console.log('App Processing - Detected language:', result.language);
            
            // Show transcript
            this.showTranscript(result.transcript, result.language);
            
            // Check if this is a language preference setting
            if (this.isLanguagePreference(result.transcript)) {
                await this.handleLanguagePreference(result);
                return;
            }
            
            // Update status
            this.updateStatus('Processing your request...');
            
            // Query the API
            console.log('App Processing - Calling API with transcript:', result.transcript);
            const apiResponse = await this.metrolinxAPI.processQuery(result.transcript);
            console.log('App Processing - API response:', apiResponse);
            
            // Generate response text
            const responseData = this.formatResponse(apiResponse, result.language);
            console.log('App Processing - Formatted response:', responseData);
            
            // Handle both old string format and new object format
            let speechText, displayText;
            if (typeof responseData === 'string') {
                speechText = displayText = responseData;
            } else {
                speechText = responseData.speech;
                displayText = responseData.display;
            }
            
            // Show response with formatted display text
            this.showResponse(displayText);
            
            // Store speech text for replay
            this.currentSpeechText = speechText;
            
            // Speak the response with enhanced event handling
            this.updateButtonState('pause');
            this.updateStatus('Playing response. Click to pause');
            
            await this.speechHandler.speak(speechText, result.language);
            
            // Update status and button after speech completes
            this.updateButtonState('default');
            this.updateStatus('Response complete. Press and hold to speak again');
            
        } catch (error) {
            console.error('App Processing - Error occurred:', error);
            console.error('App Processing - Error message:', error.message);
            console.error('App Processing - Error stack:', error.stack);
            
            // Don't show error if it's an intentional stop (double-click)
            if (this.isIntentionalStop || error.message.includes('interrupted')) {
                console.log('Speech was intentionally stopped, not showing error');
            } else {
                this.showError('Sorry, I couldn\'t process your request: ' + error.message);
            }
        } finally {
            this.isProcessing = false;
            this.resetUI();
        }
    }

    /**
     * Format API response for speech output
     */
    formatResponse(apiResponse, language = 'en') {
        const { type, data } = apiResponse;
        
        switch (type) {
            case 'schedule':
                return this.formatScheduleResponse(data, language);
            case 'status':
                return this.formatStatusResponse(data, language);
            case 'route':
                return this.formatRouteResponse(data, language);
            case 'fare':
                return this.formatFareResponse(data, language);
            default:
                if (language === 'zh') {
                    return '我找到了一些信息，但不确定如何展示。';
                } else {
                    return 'I found some information for you, but I\'m not sure how to present it.';
                }
        }
    }

    /**
     * Format schedule response
     */
    formatScheduleResponse(data, language = 'en') {
        // Use the detected language from speech recognition
        if (language === 'zh') {
            return this.formatChineseScheduleResponse(data);
        } else {
            return this.formatEnglishScheduleResponse(data);
        }
    }

    /**
     * Format schedule response in Chinese
     */
    formatChineseScheduleResponse(data) {
        let response = data.message + ' 以下是您的出行选择：... ';
        let displayText = data.message + '\n\n以下是您的出行选择：\n\n';
        
        data.schedules.forEach((schedule, index) => {
            const statusText = schedule.status === 'On Time' ? '准点' : '延误5分钟';
            
            // For speech
            response += `... 选择 ${index + 1}：您的列车 ${schedule.departure} 出发，${schedule.arrival} 到达。`;
            response += `行程时间 ${schedule.duration}，${schedule.line} 线路，${schedule.platform} 号站台。`;
            response += `此班列车目前${statusText}... ... `;
            
            // For display
            displayText += `选择 ${index + 1}：\n`;
            displayText += `• 出发时间：${schedule.departure}\n`;
            displayText += `• 到达时间：${schedule.arrival}\n`;
            displayText += `• 行程时间：${schedule.duration}\n`;
            displayText += `• 线路：${schedule.line}\n`;
            displayText += `• 站台：${schedule.platform} 号\n`;
            displayText += `• 状态：${statusText}\n\n`;
        });
        
        response += '... 祝您旅途愉快！如需其他帮助请告诉我。';
        displayText += '祝您旅途愉快！如需其他帮助请告诉我。';
        
        return { speech: response, display: displayText };
    }

    /**
     * Format schedule response in French
     */
    formatFrenchScheduleResponse(data) {
        let response = data.message + ' Voici vos options de voyage :... ';
        let displayText = data.message + '\n\nVoici vos options de voyage :\n\n';
        
        data.schedules.forEach((schedule, index) => {
            const statusText = schedule.status === 'On Time' ? 'à l\'heure' : 'retardé de 5 minutes';
            
            // For speech
            response += `... Option ${index + 1} : Votre train part à ${schedule.departure} et arrive à ${schedule.arrival}. `;
            response += `C'est un voyage de ${schedule.duration} sur la ligne ${schedule.line} depuis la plateforme ${schedule.platform}. `;
            response += `Ce train est actuellement ${statusText}... ... `;
            
            // For display
            displayText += `Option ${index + 1} :\n`;
            displayText += `• Départ : ${schedule.departure}\n`;
            displayText += `• Arrivée : ${schedule.arrival}\n`;
            displayText += `• Durée : ${schedule.duration}\n`;
            displayText += `• Ligne : ${schedule.line}\n`;
            displayText += `• Plateforme : ${schedule.platform}\n`;
            displayText += `• Statut : ${statusText}\n\n`;
        });
        
        response += '... Bon voyage ! Faites-moi savoir si vous avez besoin d\'autre chose.';
        displayText += 'Bon voyage ! Faites-moi savoir si vous avez besoin d\'autre chose.';
        
        return { speech: response, display: displayText };
    }

    /**
     * Format schedule response in English
     */
    formatEnglishScheduleResponse(data) {
        let response = data.message + ' Here are your upcoming options:... ';
        let displayText = data.message + '\n\nHere are your upcoming options:\n\n';
        
        data.schedules.forEach((schedule, index) => {
            const statusText = schedule.status === 'On Time' ? 'running on time' : schedule.status.toLowerCase();
            
            // For speech
            response += `... Option ${index + 1}: Your train departs at ${schedule.departure} and arrives at ${schedule.arrival}. `;
            response += `That's a ${schedule.duration} journey on the ${schedule.line} line from platform ${schedule.platform}. `;
            response += `This train is currently ${statusText}... ... `;
            
            // For display
            displayText += `Option ${index + 1}:\n`;
            displayText += `• Departure: ${schedule.departure}\n`;
            displayText += `• Arrival: ${schedule.arrival}\n`;
            displayText += `• Duration: ${schedule.duration}\n`;
            displayText += `• Line: ${schedule.line}\n`;
            displayText += `• Platform: ${schedule.platform}\n`;
            displayText += `• Status: ${schedule.status}\n\n`;
        });
        
        response += '... Have a great trip! Let me know if you need anything else.';
        displayText += 'Have a great trip! Let me know if you need anything else.';
        
        return { speech: response, display: displayText };
    }

    /**
     * Format status response
     */
    formatStatusResponse(data, language = 'en') {
        // Use the detected language from speech recognition
        if (language === 'zh') {
            return this.formatChineseStatusResponse(data);
        } else {
            return this.formatEnglishStatusResponse(data);
        }
    }

    /**
     * Format status response in Chinese
     */
    formatChineseStatusResponse(data) {
        let response = `您好！${data.message} `;
        let displayText = `${data.message}\n\n`;
        
        if (data.status.includes('delays') || data.status.includes('延误')) {
            response += `很抱歉，目前有一些延误。${data.status} `;
            response += `此信息最后更新时间：${data.timestamp}。`;
            response += `建议您出行前再次确认，或考虑其他路线。`;
            
            displayText += `⚠️ 服务提醒：\n${data.status}\n\n`;
            displayText += `📅 最后更新：${data.timestamp}\n\n`;
            displayText += `💡 建议：出行前再次确认，或考虑其他路线。`;
        } else {
            response += `好消息！${data.status} `;
            response += `最后更新时间：${data.timestamp}。`;
            response += `今天的行程应该很顺利！`;
            
            displayText += `✅ 服务状态：\n${data.status}\n\n`;
            displayText += `📅 最后更新：${data.timestamp}\n\n`;
            displayText += `🎉 今天的行程应该很顺利！`;
        }
        
        return { speech: response, display: displayText };
    }

    /**
     * Format status response in French
     */
    formatFrenchStatusResponse(data) {
        let response = `Bonjour ! ${data.message} `;
        let displayText = `${data.message}\n\n`;
        
        if (data.status.includes('delays') || data.status.includes('retard')) {
            response += `Je suis désolé de dire qu'il y a des retards en ce moment. ${data.status} `;
            response += `Cette information a été mise à jour pour la dernière fois ${data.timestamp}. `;
            response += `Je recommande de vérifier à nouveau avant de voyager, ou considérer des itinéraires alternatifs si vous êtes pressé.`;
            
            displayText += `⚠️ Alerte de service :\n${data.status}\n\n`;
            displayText += `📅 Dernière mise à jour : ${data.timestamp}\n\n`;
            displayText += `💡 Recommandation : Vérifiez à nouveau avant de voyager, ou considérez des itinéraires alternatifs si vous êtes pressé.`;
        } else {
            response += `Bonne nouvelle ! ${data.status} `;
            response += `Cela a été mis à jour pour la dernière fois ${data.timestamp}. `;
            response += `On dirait que tout va bien pour votre voyage aujourd'hui !`;
            
            displayText += `✅ État du service :\n${data.status}\n\n`;
            displayText += `📅 Dernière mise à jour : ${data.timestamp}\n\n`;
            displayText += `🎉 On dirait que tout va bien pour votre voyage aujourd'hui !`;
        }
        
        return { speech: response, display: displayText };
    }

    /**
     * Format status response in English
     */
    formatEnglishStatusResponse(data) {
        let response = `Hi there! ${data.message} `;
        let displayText = `${data.message}\n\n`;
        
        if (data.status.includes('delays')) {
            response += `I'm sorry to say there are some delays right now. ${data.status} `;
            response += `This information was last updated ${data.timestamp}. `;
            response += `I'd recommend checking again before you travel, or consider alternative routes if you're in a hurry.`;
            
            displayText += `⚠️ Service Alert:\n${data.status}\n\n`;
            displayText += `📅 Last Updated: ${data.timestamp}\n\n`;
            displayText += `💡 Recommendation: Check again before you travel, or consider alternative routes if you're in a hurry.`;
        } else {
            response += `Good news! ${data.status} `;
            response += `This was last updated ${data.timestamp}. `;
            response += `Looks like smooth sailing for your journey today!`;
            
            displayText += `✅ Service Status:\n${data.status}\n\n`;
            displayText += `📅 Last Updated: ${data.timestamp}\n\n`;
            displayText += `🎉 Looks like smooth sailing for your journey today!`;
        }
        
        return { speech: response, display: displayText };
    }

    /**
     * Format route response
     */
    formatRouteResponse(data, language = 'en') {
        if (language === 'zh') {
            let response = `太好了！${data.message} `;
            response += `您的总行程时间大约是 ${data.route.totalTime}`;
            
            let displayText = `${data.message}\n\n`;
            displayText += `🕐 总行程时间：${data.route.totalTime}\n`;
            
            if (data.route.transfers === 0) {
                response += '，无需换乘 - 非常方便！... ';
                displayText += `🚇 换乘：无需换乘 - 直达路线！\n\n`;
            } else if (data.route.transfers === 1) {
                response += '，只需换乘一次... ';
                displayText += `🚇 换乘：需换乘1次\n\n`;
            } else {
                response += `，需要换乘 ${data.route.transfers} 次... `;
                displayText += `🚇 换乘：需换乘${data.route.transfers}次\n\n`;
            }
            
            response += '... 以下是您的详细行程：... ';
            displayText += `📍 详细行程：\n\n`;
            
            data.route.steps.forEach((step, index) => {
                response += `... 第 ${index + 1} 步：${step}... `;
                displayText += `${index + 1}. ${step}\n\n`;
            });
            
            response += '... 祝您旅途愉快！如需其他帮助请告诉我。';
            displayText += '祝您旅途愉快！如需其他帮助请告诉我。';
            
            return { speech: response, display: displayText };
        } else {
            let response = `Perfect! ${data.message} `;
            response += `Your total travel time will be about ${data.route.totalTime}`;
            
            let displayText = `${data.message}\n\n`;
            displayText += `🕐 Total Travel Time: ${data.route.totalTime}\n`;
            
            if (data.route.transfers === 0) {
                response += ' with no transfers needed - nice and easy!... ';
                displayText += `🚇 Transfers: None needed - direct route!\n\n`;
            } else if (data.route.transfers === 1) {
                response += ' with just one transfer... ';
                displayText += `🚇 Transfers: 1 transfer\n\n`;
            } else {
                response += ` with ${data.route.transfers} transfers... `;
                displayText += `🚇 Transfers: ${data.route.transfers} transfers\n\n`;
            }
            
            response += '... Here\'s your step-by-step journey:... ';
            displayText += `📍 Step-by-Step Journey:\n\n`;
            
            data.route.steps.forEach((step, index) => {
                response += `... Step ${index + 1}: ${step}... `;
                displayText += `${index + 1}. ${step}\n\n`;
            });
            
            response += '... Safe travels! Feel free to ask if you need help with anything else.';
            displayText += 'Safe travels! Feel free to ask if you need help with anything else.';
            
            return { speech: response, display: displayText };
        }
    }

    /**
     * Format fare response
     */
    formatFareResponse(data, language = 'en') {
        if (language === 'zh') {
            let response = `好问题！${data.message} 以下是票价信息：... `;
            response += `... 成人票价是 ${data.fares.adult}... `;
            response += `... 老年人票价是 ${data.fares.senior}... `;
            response += `... 学生票价是 ${data.fares.student}... `;
            response += `... 儿童票价只需 ${data.fares.child}... `;
            response += '... 请记住，如果您符合优惠票价条件，请准备好相关证件。祝您旅途愉快！';
            
            let displayText = `${data.message}\n\n💰 票价信息：\n\n`;
            displayText += `👤 成人：${data.fares.adult}\n`;
            displayText += `👴 老年人：${data.fares.senior}\n`;
            displayText += `🎓 学生：${data.fares.student}\n`;
            displayText += `👶 儿童：${data.fares.child}\n\n`;
            displayText += '📋 请记住，如果您符合优惠票价条件，请准备好相关证件。祝您旅途愉快！';
            
            return { speech: response, display: displayText };
        } else {
            let response = `Great question! ${data.message} Here's what you'll pay:... `;
            response += `... For adults, it's ${data.fares.adult}... `;
            response += `... Seniors can travel for ${data.fares.senior}... `;
            response += `... Students pay ${data.fares.student}... `;
            response += `... and children travel for just ${data.fares.child}... `;
            response += '... Remember to have your ID ready if you qualify for discounted fares. Have a wonderful trip!';
            
            let displayText = `${data.message}\n\n💰 Fare Information:\n\n`;
            displayText += `👤 Adult: ${data.fares.adult}\n`;
            displayText += `👴 Senior: ${data.fares.senior}\n`;
            displayText += `🎓 Student: ${data.fares.student}\n`;
            displayText += `👶 Child: ${data.fares.child}\n\n`;
            displayText += '📋 Remember to have your ID ready if you qualify for discounted fares. Have a wonderful trip!';
            
            return { speech: response, display: displayText };
        }
    }

    /**
     * Show transcript in UI
     */
    showTranscript(text, language = null, isInterim = false) {
        this.elements.transcriptText.textContent = text;
        
        if (language && !isInterim) {
            const langInfo = this.speechHandler.getLanguageInfo(language);
            this.elements.detectedLanguage.textContent = `Detected: ${langInfo.flag} ${langInfo.name}`;
            this.elements.languageIndicator.textContent = `${langInfo.flag} ${langInfo.name}`;
        }
        
        if (!isInterim) {
            this.elements.transcriptDisplay.classList.add('visible');
        }
    }

    /**
     * Hide transcript
     */
    hideTranscript() {
        this.elements.transcriptDisplay.classList.remove('visible');
        this.elements.transcriptText.textContent = '';
        this.elements.detectedLanguage.textContent = '';
    }

    /**
     * Show response in UI
     */
    showResponse(text) {
        // Use innerHTML to properly render line breaks and formatting
        this.elements.responseText.innerHTML = text.replace(/\n/g, '<br>');
        this.elements.responseDisplay.classList.add('visible');
        this.elements.replayButton.style.display = 'flex';
        this.currentResponse = text;
    }

    /**
     * Hide response
     */
    hideResponse() {
        this.elements.responseDisplay.classList.remove('visible');
        this.elements.responseText.textContent = '';
        this.elements.replayButton.style.display = 'none';
        this.currentResponse = null;
    }

    /**
     * Replay the last response
     */
    async replayResponse() {
        if (!this.currentResponse || this.isProcessing) {
            return;
        }

        try {
            this.updateStatus('Replaying response...');
            await this.speechHandler.replayLastSpeech();
            this.updateStatus('Replay complete. Press and hold to speak again');
        } catch (error) {
            console.error('Replay error:', error);
            this.showError('Could not replay the response: ' + error.message);
        }
    }

    /**
     * Update status text
     */
    updateStatus(text) {
        this.elements.statusText.textContent = text;
    }

    /**
     * Show error modal
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorModal.style.display = 'flex';
    }

    /**
     * Hide error modal
     */
    hideError() {
        this.elements.errorModal.style.display = 'none';
        this.elements.errorMessage.textContent = '';
    }

    /**
     * Reset UI to initial state
     */
    resetUI() {
        this.elements.voiceButton.classList.remove('recording');
        this.elements.languageIndicator.textContent = '';
        this.updateButtonState('default');
    }

    /**
     * Update button state and text based on current app state
     */
    updateButtonState(state) {
        const button = this.elements.voiceButton;
        const buttonText = button.querySelector('.button-text');
        
        // Remove all state classes
        button.classList.remove('pause-mode', 'continue-mode');
        
        switch (state) {
            case 'default':
                buttonText.textContent = 'Hold to Speak';
                break;
            case 'pause':
                button.classList.add('pause-mode');
                buttonText.textContent = 'Pause';
                break;
            case 'continue':
                button.classList.add('continue-mode');
                buttonText.textContent = 'Continue';
                break;
        }
    }

    /**
     * Check if the input is a language preference statement
     */
    isLanguagePreference(text) {
        const lowerText = text.toLowerCase().trim();
        return lowerText === '中文' || 
               lowerText === 'english' || 
               lowerText === 'chinese' || 
               lowerText === 'english language' ||
               lowerText === 'speak english' ||
               lowerText === 'zhongwen';
    }

    /**
     * Handle language preference setting
     */
    async handleLanguagePreference(result) {
        try {
            const lowerText = result.transcript.toLowerCase().trim();
            let responseText = '';
            let language = result.language;

            if (lowerText === '中文' || lowerText === 'chinese' || lowerText === 'zhongwen') {
                responseText = '好的！我现在会优先识别中文。请继续用中文提问关于交通的问题。';
                language = 'zh';
            } else if (lowerText === 'english' || lowerText === 'english language' || lowerText === 'speak english') {
                responseText = 'Perfect! I\'ll now prioritize English recognition. Please continue with your transit questions in English.';
                language = 'en';
            }

            // Show the preference confirmation
            this.showResponse(responseText);
            
            // Speak the confirmation
            this.updateButtonState('pause');
            this.updateStatus('Language preference set. Click to pause');
            
            await this.speechHandler.speak(responseText, language);
            
            // Update status and button after speech completes
            this.updateButtonState('default');
            this.updateStatus('Language preference updated. Press and hold to speak again');
            
        } catch (error) {
            console.error('Error handling language preference:', error);
            this.showError('Sorry, I couldn\'t set your language preference: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.resetUI();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceTransitApp = new VoiceTransitApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.voiceTransitApp) {
        window.voiceTransitApp.stopVoiceInput();
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
    if (window.voiceTransitApp) {
        window.voiceTransitApp.stopVoiceInput();
    }
});
