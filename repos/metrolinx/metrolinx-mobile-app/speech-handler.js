/**
 * Speech Handler for Voice Recognition and Text-to-Speech
 * Supports multilingual input/output with language detection
 */

class SpeechHandler {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentLanguage = 'en-US';
        this.lastUtterance = null;
        this.preferredLanguage = null; // User's stated language preference
        
        // Language mappings for speech recognition and synthesis
        this.languageMap = {
            'en': { 
                recognition: 'en-US', 
                synthesis: 'en-US',
                name: 'English',
                flag: '🇺🇸'
            },
            'zh': { 
                recognition: 'zh-CN', 
                synthesis: 'zh-CN',
                name: '中文',
                flag: '🇨🇳'
            }
        };

        this.initializeSpeechRecognition();
        this.loadVoices();
    }

    /**
     * Initialize Web Speech API recognition
     */
    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            throw new Error('Speech recognition not supported in this browser');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        
        // Set initial language
        this.recognition.lang = this.languageMap['en'].recognition;
    }

    /**
     * Load available voices for text-to-speech
     */
    loadVoices() {
        // Wait for voices to be loaded
        if (this.synthesis.getVoices().length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.voices = this.synthesis.getVoices();
            });
        } else {
            this.voices = this.synthesis.getVoices();
        }
    }

    /**
     * Set user's preferred language based on their statement
     */
    setLanguagePreference(text) {
        const lowerText = text.toLowerCase().trim();
        
        // Check for Chinese preference
        if (lowerText === '中文' || lowerText === 'chinese' || lowerText === 'zhongwen') {
            this.preferredLanguage = 'zh';
            console.log('User preference set to Chinese');
            return 'zh';
        }
        
        // Check for English preference
        if (lowerText === 'english' || lowerText === 'english language' || lowerText === 'speak english') {
            this.preferredLanguage = 'en';
            console.log('User preference set to English');
            return 'en';
        }
        
        return null; // No preference detected
    }

    /**
     * Get prioritized language order based on user preference
     */
    getLanguagePriority() {
        // Always try Chinese first for better Chinese recognition
        // This ensures Chinese speech is properly captured
        return ['zh-CN', 'en-US'];
    }

    /**
     * Detect language from text using enhanced heuristics
     */
    detectLanguage(text) {
        const originalText = text;
        const lowerText = text.toLowerCase();
        
        // First check if this is a language preference statement
        const preferenceSet = this.setLanguagePreference(text);
        if (preferenceSet) {
            return preferenceSet;
        }
        
        // PRIORITY: Check for language-specific greetings first (most important for user experience)
        const chineseGreetings = [
            '你好', 'nihao', 'ni hao', 'neehow', 'knee how', 'nee how',
            '您好', 'nin hao', 'ninhao', 'nin how', 'knee how',
            '早上好', 'zao shang hao', 'morning good',
            '晚上好', 'wan shang hao', 'evening good'
        ];
        
        const englishGreetings = [
            'hello metrolinx', 'hello metro linx', 'hello metro links',
            'hi metrolinx', 'hi metro linx', 'hi metro links',
            'good morning metrolinx', 'good afternoon metrolinx', 'good evening metrolinx'
        ];
        
        // Check if the text starts with or contains Chinese greetings
        for (const greeting of chineseGreetings) {
            if (lowerText.includes(greeting) || originalText.includes(greeting)) {
                console.log(`Chinese greeting detected: "${greeting}" in "${text}"`);
                // Set user preference to Chinese when they greet in Chinese
                this.preferredLanguage = 'zh';
                return 'zh';
            }
        }
        
        // Check if the text starts with or contains English greetings to Metrolinx
        for (const greeting of englishGreetings) {
            if (lowerText.includes(greeting)) {
                console.log(`English Metrolinx greeting detected: "${greeting}" in "${text}"`);
                // Set user preference to English when they greet Metrolinx in English
                this.preferredLanguage = 'en';
                return 'en';
            }
        }
        
        // Chinese detection (comprehensive Unicode ranges)
        const chinesePattern = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]/;
        const chineseCharCount = (text.match(chinesePattern) || []).length;
        const totalCharCount = text.length;
        
        // Detect Chinese if we have actual Chinese characters (more lenient now)
        if (chineseCharCount > 0 && (chineseCharCount / totalCharCount) > 0.2) {
            console.log(`Chinese characters detected: ${chineseCharCount}/${totalCharCount} characters`);
            return 'zh';
        }
        
        
        // Enhanced English detection - more robust
        const englishWords = [
            // Very common English words (high confidence indicators)
            'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would',
            'what', 'when', 'where', 'why', 'how', 'who', 'which', 'this', 'that', 'these', 'those',
            // English-specific words not found in French
            'schedule', 'departure', 'arrival', 'delay', 'fare', 'ticket',
            'subway', 'transfer', 'platform', 'route', 'cost', 'price'
        ];
        
        const englishPhrases = [
            'what time does', 'how much does', 'how do i get', 'where is the', 'when does the',
            'are there any', 'what is the', 'how long does', 'can you tell me', 'i need to',
            'can you help', 'tell me about', 'i want to'
        ];
        
        let englishScore = 0;
        
        // Count English words with word boundaries
        englishWords.forEach(word => {
            const wordRegex = new RegExp('\\b' + word + '\\b', 'i');
            if (wordRegex.test(lowerText)) {
                englishScore += 2; // Higher weight for exact matches
            }
        });
        
        // Count English phrases
        englishPhrases.forEach(phrase => {
            if (lowerText.includes(phrase)) {
                englishScore += 4; // High weight for English phrases
            }
        });
        
        // Boost English score for pure English content
        if (englishScore > 0) {
            englishScore += 2; // Bonus for English content
        }
        
        // Enhanced English detection for accented speakers
        const accentedEnglishPatterns = [
            // Common patterns that might be misinterpreted as Chinese
            /\b(what|when|where|why|how|can|could|would|should|will|time|train|bus|station|platform|ticket|schedule|departure|arrival|cost|price|fare|route|transfer|delay|service|status|information|help|please|thank|you|me|my|i|am|is|are|was|were|have|has|had|do|does|did|get|go|come|take|need|want|know|tell|show|find|from|to|at|in|on|by|with|for|about|next|last|first|second|third|today|tomorrow|yesterday|morning|afternoon|evening|night|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi
        ];
        
        // Boost English score for accented speech patterns
        let accentedEnglishScore = 0;
        accentedEnglishPatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches && matches.length > 0) {
                accentedEnglishScore += matches.length * 2;
            }
        });
        
        englishScore += accentedEnglishScore;
        
        // Chinese keywords detection (MORE LENIENT FOR SPEECH RECOGNITION)
        const chineseKeywords = [
            // Common Chinese words/phrases
            '你好', '谢谢', '在哪儿', '多少钱', '几点', '怎么走',
            '火车', '地铁', '公交', '站', '票', '时间', '去', '到', '从',
            '什么时候', '多长时间', '怎么', '哪里', '哪儿', '什么'
        ];
        
        // More comprehensive phonetic approximations for speech recognition
        const chinesePhoneticPatterns = [
            'ni hao', 'xie xie', 'duo shao qian', 'ji dian', 'zen me zou',
            'huo che', 'di tie', 'gong jiao', 'qu', 'dao', 'cong',
            'shen me shi hou', 'duo chang shi jian', 'zen me', 'na li', 'na er',
            // Common misrecognitions by speech engines
            'wo yao qu', 'wo xiang qu', 'ji dian', 'duo shao', 'zen yang',
            'chinga', 'leotard', 'columbia', 'detergent', // Known misrecognitions
            // Additional common Chinese speech patterns that get misrecognized
            'wo qu', 'wo yao', 'wo xiang', 'zai na li', 'zai nar', 'duo shao',
            'ji dian zhong', 'shen me shi jian', 'zen me ban', 'zen me qu',
            'hao de', 'xie xie ni', 'bu yong xie', 'mei guan xi',
            // Common transit-related Chinese phrases
            'huo che zhan', 'di tie zhan', 'gong jiao che', 'che piao',
            'duo shao qian', 'ji dian kai', 'ji dian dao', 'yao duo jiu',
            // Phonetic approximations that sound like Chinese
            'ching', 'chong', 'chang', 'cheng', 'chung', 'jiang', 'jing',
            'sheng', 'shing', 'zheng', 'zhing', 'yang', 'ying', 'yong',
            'dian', 'tian', 'lian', 'nian', 'xian', 'jian'
        ];
        
        let chineseKeywordScore = 0;
        chineseKeywords.forEach(keyword => {
            if (originalText.includes(keyword) || lowerText.includes(keyword)) {
                chineseKeywordScore += 5; // Higher weight for actual Chinese
            }
        });
        
        chinesePhoneticPatterns.forEach(pattern => {
            if (lowerText.includes(pattern)) {
                chineseKeywordScore += 5; // Only for very specific patterns
                console.log(`Chinese phonetic pattern detected: "${pattern}"`);
            }
        });
        
        // Add Chinese character score to keyword score
        const totalChineseScore = chineseKeywordScore + (chineseCharCount > 0 ? chineseCharCount * 5 : 0);
        
        console.log(`Language detection scores - English: ${englishScore}, Chinese: ${totalChineseScore}`);
        console.log(`Text analyzed: "${text}"`);
        
        // More balanced language detection - don't heavily favor English
        if (totalChineseScore > 5 && totalChineseScore >= englishScore) {
            console.log('Detected Chinese based on keywords/characters');
            return 'zh';
        } else if (englishScore > totalChineseScore) {
            console.log('Detected English based on keywords');
            return 'en';
        } else {
            // If scores are equal or both low, use user preference or default
            if (this.preferredLanguage === 'zh') {
                console.log('Using Chinese preference as fallback');
                return 'zh';
            } else {
                console.log('Using English as fallback');
                return 'en';
            }
        }
    }

    /**
     * Start voice recognition - Enhanced for better speech detection
     */
    async startListening() {
        if (this.isListening) {
            console.log('Recognition already in progress, skipping...');
            return;
        }

        try {
            // Ensure clean state
            await this.stopListening();
            
            // Wait a bit to ensure cleanup
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('Starting enhanced speech recognition...');
            
            // Try multiple approaches for better speech detection
            let result = null;
            
            // First try Chinese recognition
            console.log('Trying Chinese (zh-CN) recognition...');
            result = await this.tryRecognitionWithLanguage('zh-CN');
            
            if (result && result.transcript) {
                console.log(`Chinese recognition successful: "${result.transcript}"`);
                this.currentLanguage = 'zh-CN';
                
                // Detect the actual language of the transcript
                const detectedLang = this.detectLanguage(result.transcript);
                console.log(`Language detected from Chinese recognition: ${detectedLang}`);
                
                return {
                    transcript: result.transcript.trim(),
                    language: detectedLang, // Use detected language
                    confidence: result.confidence || 0.8
                };
            }
            
            // If Chinese didn't work, try English as fallback
            console.log('Chinese recognition failed, trying English as fallback...');
            result = await this.tryRecognitionWithLanguage('en-US');
            
            if (result && result.transcript) {
                console.log(`English recognition successful: "${result.transcript}"`);
                this.currentLanguage = 'en-US';
                
                // Detect the actual language of the transcript
                const detectedLang = this.detectLanguage(result.transcript);
                console.log(`Language detected from English recognition: ${detectedLang}`);
                
                return {
                    transcript: result.transcript.trim(),
                    language: detectedLang, // Use detected language for proper response
                    confidence: result.confidence || 0.6
                };
            }
            
            // Return null if no speech detected in any language
            console.log('No speech detected in any language');
            return null;
            
        } catch (error) {
            this.isListening = false;
            console.error('Speech recognition error:', error);
            throw error;
        }
    }

    /**
     * Try recognition with a specific language
     */
    async tryRecognitionWithLanguage(lang) {
        return new Promise((resolve, reject) => {
            if (this.isListening) {
                reject(new Error('Recognition already in progress'));
                return;
            }

            this.recognition.lang = lang;
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 5;
            
            // Special settings for Chinese recognition
            if (lang.startsWith('zh')) {
                console.log('Applying Chinese-specific recognition settings');
                this.recognition.continuous = true; // Allow longer continuous recognition for Chinese
                this.recognition.interimResults = true;
                this.recognition.maxAlternatives = 10; // More alternatives for Chinese
            }
            
            let finalTranscript = '';
            let interimTranscript = '';
            let hasResolved = false;
            let timeout;
            let hasReceivedAnyResult = false;

            // Clear any existing event handlers
            this.recognition.onstart = null;
            this.recognition.onresult = null;
            this.recognition.onend = null;
            this.recognition.onerror = null;
            this.recognition.onspeechstart = null;
            this.recognition.onspeechend = null;
            this.recognition.onaudiostart = null;
            this.recognition.onaudioend = null;

            this.recognition.onstart = () => {
                console.log(`Speech recognition started for ${lang}`);
                this.isListening = true;
                // Longer timeout for Chinese, shorter for English
                const timeoutDuration = lang.startsWith('zh') ? 12000 : 6000;
                timeout = setTimeout(() => {
                    if (!hasResolved) {
                        console.log(`Recognition timeout for ${lang} after ${timeoutDuration}ms`);
                        hasResolved = true;
                        this.isListening = false;
                        try {
                            this.recognition.stop();
                        } catch (e) {}
                        
                        // If we got some interim results, use them
                        if (hasReceivedAnyResult && (finalTranscript.trim() || interimTranscript.trim())) {
                            const transcript = finalTranscript.trim() || interimTranscript.trim();
                            console.log(`Using interim result due to timeout: "${transcript}"`);
                            resolve({
                                transcript: transcript,
                                confidence: 0.4 // Lower confidence for timeout results
                            });
                        } else {
                            resolve(null); // No result within timeout
                        }
                    }
                }, timeoutDuration);
            };

            this.recognition.onaudiostart = () => {
                console.log(`Audio capture started for ${lang}`);
            };

            this.recognition.onspeechstart = () => {
                console.log(`Speech detected for ${lang}`);
            };

            this.recognition.onresult = (event) => {
                if (hasResolved) return;
                
                hasReceivedAnyResult = true;
                interimTranscript = '';
                let allAlternatives = [];
                
                console.log(`Got ${event.results.length} results for ${lang}`);
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;
                    
                    console.log(`Result ${i}: "${transcript}" (final: ${result.isFinal}, confidence: ${result[0].confidence})`);
                    
                    // Collect all alternatives
                    for (let j = 0; j < Math.min(result.length, 5); j++) {
                        allAlternatives.push({
                            transcript: result[j].transcript,
                            confidence: result[j].confidence || 0.5
                        });
                    }
                    
                    if (result.isFinal) {
                        finalTranscript += transcript;
                        console.log(`Final transcript updated: "${finalTranscript}"`);
                        
                        // For Chinese, if we get a final result, use it immediately
                        if (lang.startsWith('zh') && finalTranscript.trim()) {
                            clearTimeout(timeout);
                            hasResolved = true;
                            this.isListening = false;
                            
                            try {
                                this.recognition.stop();
                            } catch (e) {}
                            
                            const confidence = result[0].confidence || 0.6;
                            console.log(`Using Chinese final result immediately: "${finalTranscript}" (confidence: ${confidence})`);
                            
                            resolve({
                                transcript: finalTranscript.trim(),
                                confidence: confidence
                            });
                            return;
                        }
                    } else {
                        interimTranscript += transcript;
                        console.log(`Interim transcript: "${interimTranscript}"`);
                    }
                }

                // Log alternatives for debugging
                if (allAlternatives.length > 1) {
                    console.log(`Speech alternatives for ${lang}:`, allAlternatives.slice(0, 3));
                }

                // Update UI with interim results
                if (this.onInterimResult) {
                    this.onInterimResult(interimTranscript || finalTranscript);
                }
                
                // For Chinese, if we have good interim results, consider using them
                if (lang.startsWith('zh') && interimTranscript.trim() && !hasResolved) {
                    const chinesePattern = /[\u4e00-\u9fff]/;
                    if (chinesePattern.test(interimTranscript)) {
                        console.log(`Chinese characters detected in interim result: "${interimTranscript}"`);
                        // Don't resolve immediately, but note we have good Chinese content
                    }
                }
            };

            this.recognition.onspeechend = () => {
                console.log(`Speech ended for ${lang}`);
            };

            this.recognition.onaudioend = () => {
                console.log(`Audio capture ended for ${lang}`);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                clearTimeout(timeout);
                
                console.log(`Recognition ended for ${lang}. Final: "${finalTranscript}", Interim: "${interimTranscript}"`);
                
                if (hasResolved) return;
                
                const transcript = finalTranscript.trim() || interimTranscript.trim();
                
                if (transcript) {
                    hasResolved = true;
                    
                    // Calculate confidence based on language match and transcript quality
                    const detectedLang = this.detectLanguage(transcript);
                    let confidence = 0.5; // Base confidence
                    
                    // Boost confidence if detected language matches recognition language
                    const langPrefix = lang.split('-')[0];
                    if (detectedLang === langPrefix || 
                        (detectedLang === 'zh' && langPrefix === 'zh') ||
                        (detectedLang === 'en' && langPrefix === 'en')) {
                        confidence += 0.3;
                    }
                    
                    // Boost confidence for longer, more coherent text
                    if (transcript.length > 10) {
                        confidence += 0.1;
                    }
                    
                    // Boost confidence if we detect strong language indicators
                    if (this.hasStrongLanguageIndicators(transcript, detectedLang)) {
                        confidence += 0.2;
                    }
                    
                    // Special boost for Chinese characters
                    if (lang.startsWith('zh')) {
                        const chinesePattern = /[\u4e00-\u9fff]/;
                        if (chinesePattern.test(transcript)) {
                            confidence += 0.3;
                            console.log(`Chinese characters detected, boosting confidence to ${confidence}`);
                        }
                    }
                    
                    console.log(`Resolving with transcript: "${transcript}" (confidence: ${Math.min(confidence, 1.0)})`);
                    
                    resolve({
                        transcript: transcript,
                        confidence: Math.min(confidence, 1.0)
                    });
                } else {
                    hasResolved = true;
                    console.log(`No speech detected for ${lang}`);
                    resolve(null); // No speech detected
                }
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                clearTimeout(timeout);
                
                console.log(`Recognition error for ${lang}: ${event.error}`);
                
                if (hasResolved) return;
                hasResolved = true;
                
                if (event.error === 'no-speech') {
                    console.log(`No speech detected for ${lang}`);
                    resolve(null);
                } else if (event.error === 'aborted') {
                    console.log(`Recognition aborted for ${lang}`);
                    resolve(null);
                } else if (event.error === 'network') {
                    console.log(`Network error for ${lang}, trying offline recognition`);
                    resolve(null);
                } else {
                    console.log(`Other error for ${lang}: ${event.error}`);
                    resolve(null); // Don't reject, just return null to try next language
                }
            };

            // Start recognition with error handling
            try {
                console.log(`Starting recognition for ${lang}...`);
                this.recognition.start();
            } catch (startError) {
                this.isListening = false;
                clearTimeout(timeout);
                hasResolved = true;
                
                console.log(`Failed to start recognition for ${lang}:`, startError);
                
                if (startError.message.includes('already started')) {
                    reject(new Error('Recognition is busy. Please try again.'));
                } else {
                    resolve(null); // Don't reject, just return null
                }
            }
        });
    }

    /**
     * Check if text has strong language indicators
     */
    hasStrongLanguageIndicators(text, detectedLang) {
        const lowerText = text.toLowerCase();
        
        if (detectedLang === 'zh') {
            // Check for Chinese characters or strong phonetic patterns
            const chinesePattern = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
            if (chinesePattern.test(text)) return true;
            
            // Check for strong phonetic patterns
            const strongPatterns = [
                'chinga was home union detergent',
                'leotard columbia',
                'play a true copy'
            ];
            return strongPatterns.some(pattern => lowerText.includes(pattern));
        }
        
        if (detectedLang === 'fr') {
            // Check for French accents or distinctive words
            const frenchAccents = /[àâäéèêëïîôöùûüÿç]/;
            if (frenchAccents.test(text)) return true;
            
            const strongFrenchWords = ['bonjour', 'merci', 'où', 'combien', 'métro', 'gare'];
            return strongFrenchWords.some(word => lowerText.includes(word));
        }
        
        if (detectedLang === 'en') {
            // Check for distinctive English patterns
            const strongEnglishPhrases = [
                'what time does', 'how much does', 'where is the', 'can you tell me'
            ];
            return strongEnglishPhrases.some(phrase => lowerText.includes(phrase));
        }
        
        return false;
    }

    /**
     * Stop voice recognition
     */
    async stopListening() {
        return new Promise((resolve) => {
            if (this.recognition && this.isListening) {
                // Set up one-time end handler for cleanup
                const cleanup = () => {
                    this.isListening = false;
                    resolve();
                };
                
                this.recognition.addEventListener('end', cleanup, { once: true });
                
                try {
                    this.recognition.stop();
                } catch (error) {
                    console.warn('Error stopping recognition:', error);
                    this.isListening = false;
                    resolve();
                }
                
                // Fallback timeout
                setTimeout(() => {
                    this.isListening = false;
                    resolve();
                }, 1000);
            } else {
                this.isListening = false;
                resolve();
            }
        });
    }

    /**
     * Convert text to speech in the specified language
     */
    async speak(text, language = 'en') {
        if (!text || !this.synthesis) {
            throw new Error('Text-to-speech not available');
        }

        // Stop any current speech
        this.synthesis.cancel();
        this.isPaused = false;

        const langConfig = this.languageMap[language];
        if (!langConfig) {
            throw new Error(`Language ${language} not supported`);
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance for friendly, natural speech
            utterance.lang = langConfig.synthesis;
            utterance.rate = 0.85; // Slightly slower for clarity and friendliness
            utterance.pitch = 1.1; // Slightly higher pitch for warmth
            utterance.volume = 0.9; // Slightly softer volume

            // Find appropriate voice (prefer female voices for friendliness)
            const voice = this.findBestVoice(langConfig.synthesis, true);
            if (voice) {
                utterance.voice = voice;
            }

            // Event handlers
            utterance.onstart = () => {
                console.log('Speech synthesis started');
                this.isSpeaking = true;
                this.isPaused = false;
            };

            utterance.onend = () => {
                console.log('Speech synthesis completed');
                this.isSpeaking = false;
                this.isPaused = false;
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.isSpeaking = false;
                this.isPaused = false;
                reject(new Error(`Speech synthesis failed: ${event.error}`));
            };

            utterance.onpause = () => {
                console.log('Speech synthesis paused');
                this.isPaused = true;
            };

            utterance.onresume = () => {
                console.log('Speech synthesis resumed');
                this.isPaused = false;
            };

            // Store reference for replay functionality
            this.lastUtterance = utterance;

            // Start speaking
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Pause current speech synthesis
     */
    pauseSpeech() {
        if (this.synthesis && this.isSpeaking && !this.isPaused) {
            this.synthesis.pause();
            console.log('Speech paused');
            return true;
        }
        return false;
    }

    /**
     * Resume paused speech synthesis
     */
    resumeSpeech() {
        if (this.synthesis && this.isSpeaking && this.isPaused) {
            this.synthesis.resume();
            console.log('Speech resumed');
            return true;
        }
        return false;
    }

    /**
     * Stop current speech synthesis
     */
    stopSpeech() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.isPaused = false;
            console.log('Speech stopped');
            return true;
        }
        return false;
    }

    /**
     * Check if speech is currently active
     */
    isSpeechActive() {
        return this.isSpeaking;
    }

    /**
     * Check if speech is currently paused
     */
    isSpeechPaused() {
        return this.isPaused;
    }

    /**
     * Find the best voice for a given language
     */
    findBestVoice(lang, preferFemale = false) {
        if (!this.voices) {
            this.voices = this.synthesis.getVoices();
        }

        const langPrefix = lang.split('-')[0];
        let candidates = this.voices.filter(v => 
            v.lang === lang || v.lang.startsWith(langPrefix)
        );

        if (candidates.length === 0) {
            return null;
        }

        // Prefer local voices over remote
        const localVoices = candidates.filter(v => v.localService);
        if (localVoices.length > 0) {
            candidates = localVoices;
        }

        // If preferring female voices, try to find one
        if (preferFemale) {
            const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'susan', 'victoria', 'karen', 'moira', 'tessa', 'veena', 'fiona'];
            const femaleVoice = candidates.find(v => 
                femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
            );
            if (femaleVoice) {
                return femaleVoice;
            }
        }

        // Return the first available voice
        return candidates[0];
    }

    /**
     * Replay the last spoken text
     */
    async replayLastSpeech() {
        if (this.lastUtterance && this.lastUtterance.text) {
            this.synthesis.cancel();
            
            return new Promise((resolve, reject) => {
                // Create a new utterance with the same text and properties
                const utterance = new SpeechSynthesisUtterance(this.lastUtterance.text);
                
                // Copy all properties from the original utterance
                utterance.lang = this.lastUtterance.lang;
                utterance.rate = this.lastUtterance.rate;
                utterance.pitch = this.lastUtterance.pitch;
                utterance.volume = this.lastUtterance.volume;
                utterance.voice = this.lastUtterance.voice;

                // Set up event handlers
                utterance.onstart = () => {
                    console.log('Replay started');
                };

                utterance.onend = () => {
                    console.log('Replay completed');
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.error('Replay error:', event.error);
                    reject(new Error(`Replay failed: ${event.error}`));
                };

                // Start speaking the replay
                this.synthesis.speak(utterance);
            });
        } else {
            throw new Error('No previous speech to replay');
        }
    }

    /**
     * Get language information
     */
    getLanguageInfo(langCode) {
        return this.languageMap[langCode] || this.languageMap['en'];
    }

    /**
     * Check if speech recognition is supported
     */
    static isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Check if text-to-speech is supported
     */
    static isSpeechSynthesisSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Request microphone permissions
     */
    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            return false;
        }
    }
}

// Export for use in other modules
window.SpeechHandler = SpeechHandler;
