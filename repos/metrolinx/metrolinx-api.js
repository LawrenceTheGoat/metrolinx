/**
 * Mock Metrolinx API for demonstration purposes
 * Simulates real-time transit information queries with multilingual support
 */

class MetrolinxAPI {
    constructor() {
        this.stations = {
            'union': 'Union Station',
            'union station': 'Union Station',
            'bloor': 'Bloor Station',
            'bloor station': 'Bloor Station',
            'dundas west': 'Dundas West Station',
            'dundas west station': 'Dundas West Station',
            'kipling': 'Kipling Station',
            'kipling station': 'Kipling Station',
            'kennedy': 'Kennedy Station',
            'kennedy station': 'Kennedy Station',
            'scarborough centre': 'Scarborough Centre Station',
            'scarborough centre station': 'Scarborough Centre Station',
            'finch': 'Finch Station',
            'finch station': 'Finch Station',
            'york mills': 'York Mills Station',
            'york mills station': 'York Mills Station',
            'sheppard': 'Sheppard Station',
            'sheppard station': 'Sheppard Station',
            'oriole': 'Oriole Station',
            'oriole station': 'Oriole Station',
            'milliken': 'Milliken Station',
            'milliken station': 'Milliken Station',
            'agincourt': 'Agincourt Station',
            'agincourt station': 'Agincourt Station',
            'malton': 'Malton Station',
            'malton station': 'Malton Station',
            'pearson': 'Pearson Airport',
            'pearson airport': 'Pearson Airport',
            'airport': 'Pearson Airport',
            // Chinese station names
            '联合车站': 'Union Station',
            '布洛尔站': 'Bloor Station',
            '肯尼迪站': 'Kennedy Station',
            '皮尔逊机场': 'Pearson Airport',
            '机场': 'Pearson Airport'
        };

        this.lines = {
            'go train': 'GO Train',
            'go': 'GO Train',
            'lakeshore west': 'Lakeshore West Line',
            'lakeshore east': 'Lakeshore East Line',
            'milton': 'Milton Line',
            'kitchener': 'Kitchener Line',
            'barrie': 'Barrie Line',
            'richmond hill': 'Richmond Hill Line',
            'stouffville': 'Stouffville Line'
        };
    }

    /**
     * Detect language of the query
     */
    detectQueryLanguage(text) {
        // Chinese detection
        const chinesePattern = /[\u4e00-\u9fff]/;
        const chineseCharCount = (text.match(chinesePattern) || []).length;
        if (chineseCharCount > 0) {
            return 'zh';
        }

        // French detection
        const frenchWords = ['bonjour', 'merci', 'où', 'quand', 'comment', 'combien', 'gare', 'train', 'horaire', 'métro'];
        const frenchCount = frenchWords.filter(word => text.toLowerCase().includes(word)).length;
        if (frenchCount > 0) {
            return 'fr';
        }

        return 'en'; // Default to English
    }

    /**
     * Check if query is asking for schedule information
     */
    isScheduleQuery(text, language = 'en') {
        const keywords = {
            'en': ['schedule', 'time', 'when', 'departure', 'arrival', 'train', 'next'],
            'fr': ['horaire', 'heure', 'quand', 'départ', 'arrivée', 'train', 'prochain'],
            'zh': ['时刻表', '时间', '几点', '火车', '列车', '班次', '下一班']
        };
        
        const langKeywords = keywords[language] || keywords['en'];
        return langKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Check if query is asking for service status
     */
    isStatusQuery(text, language = 'en') {
        const keywords = {
            'en': ['status', 'delay', 'late', 'service', 'problem', 'issue'],
            'fr': ['statut', 'retard', 'service', 'problème', 'état'],
            'zh': ['状态', '延误', '晚点', '服务', '问题']
        };
        
        const langKeywords = keywords[language] || keywords['en'];
        return langKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Check if query is asking for route information
     */
    isRouteQuery(text, language = 'en') {
        const keywords = {
            'en': ['route', 'how to get', 'travel', 'go from', 'directions', 'way'],
            'fr': ['route', 'comment aller', 'voyager', 'aller de', 'directions', 'chemin'],
            'zh': ['路线', '怎么走', '如何去', '从', '到', '方向']
        };
        
        const langKeywords = keywords[language] || keywords['en'];
        return langKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Check if query is asking for fare information
     */
    isFareQuery(text, language = 'en') {
        const keywords = {
            'en': ['fare', 'cost', 'price', 'how much', 'money', 'ticket'],
            'fr': ['tarif', 'coût', 'prix', 'combien', 'argent', 'billet'],
            'zh': ['票价', '费用', '价格', '多少钱', '钱', '票']
        };
        
        const langKeywords = keywords[language] || keywords['en'];
        return langKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Process user query and return appropriate response
     */
    async processQuery(query) {
        try {
            // Simulate API processing delay
            await this.delay(800);
            
            const lowerQuery = query.toLowerCase();
            const originalQuery = query;
            
            // Detect language for appropriate response
            const language = this.detectQueryLanguage(originalQuery);
            console.log(`API Processing - Original query: "${originalQuery}"`);
            console.log(`API Processing - Detected language: ${language}`);
            console.log(`API Processing - Lower query: "${lowerQuery}"`);
            
            // For Chinese queries, also check the original query (not just lowercase)
            const queryToCheck = language === 'zh' ? originalQuery : lowerQuery;
            
            // Determine query type based on keywords (multilingual)
            if (this.isScheduleQuery(queryToCheck, language)) {
                console.log('API Processing - Detected as schedule query');
                return this.getScheduleInfo(query, language);
            } else if (this.isStatusQuery(queryToCheck, language)) {
                console.log('API Processing - Detected as status query');
                return this.getServiceStatus(language);
            } else if (this.isRouteQuery(queryToCheck, language)) {
                console.log('API Processing - Detected as route query');
                return this.getRouteInfo(query, language);
            } else if (this.isFareQuery(queryToCheck, language)) {
                console.log('API Processing - Detected as fare query');
                return this.getFareInfo(query, language);
            } else {
                // Check if this is a non-transit query
                if (this.isNonTransitQuery(queryToCheck)) {
                    console.log('API Processing - Non-transit query detected');
                    return this.getNonTransitResponse(query, language);
                }
                
                // For Chinese, default to schedule if no specific intent detected
                if (language === 'zh') {
                    console.log('API Processing - Chinese query, defaulting to schedule');
                    return this.getScheduleInfo(query, language);
                }
                
                // If no language detected (all scores 0), assume it might be Chinese speech recognition issue
                // and default to schedule information since user only wants Metrolinx schedule info
                console.log('API Processing - No clear intent detected, defaulting to schedule information');
                return this.getScheduleInfo(query, language);
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get schedule information
     */
    async getScheduleInfo(query, language = 'en') {
        const stations = this.extractStations(query);
        const schedules = this.generateSchedules();
        
        const messages = {
            'en': `Train schedule information:`,
            'fr': `Informations sur les horaires de train:`,
            'zh': `列车时刻表信息：`
        };

        return {
            type: 'schedule',
            data: {
                schedules,
                message: messages[language] || messages['en']
            }
        };
    }

    /**
     * Get service status
     */
    async getServiceStatus(language = 'en') {
        const statuses = {
            'en': 'All GO Train services are operating normally',
            'fr': 'Tous les services GO Train fonctionnent normalement',
            'zh': '所有GO列车服务正常运行'
        };

        const messages = {
            'en': 'Current service status:',
            'fr': 'État actuel du service:',
            'zh': '当前服务状态：'
        };

        return {
            type: 'status',
            data: {
                status: statuses[language] || statuses['en'],
                message: messages[language] || messages['en'],
                timestamp: new Date().toLocaleString()
            }
        };
    }

    /**
     * Get route information
     */
    async getRouteInfo(query, language = 'en') {
        const stations = this.extractStations(query);
        const route = this.generateRoute();
        
        const messages = {
            'en': `Route planning information:`,
            'fr': `Informations de planification d'itinéraire:`,
            'zh': `路线规划信息：`
        };

        return {
            type: 'route',
            data: {
                route,
                message: messages[language] || messages['en']
            }
        };
    }

    /**
     * Get fare information
     */
    async getFareInfo(query, language = 'en') {
        const fares = this.generateFares();
        
        const messages = {
            'en': `Fare information:`,
            'fr': `Informations tarifaires:`,
            'zh': `票价信息：`
        };

        return {
            type: 'fare',
            data: {
                fares,
                message: messages[language] || messages['en']
            }
        };
    }

    /**
     * Extract station names from query
     */
    extractStations(query) {
        const lowerQuery = query.toLowerCase();
        const foundStations = [];
        
        for (const [key, value] of Object.entries(this.stations)) {
            if (lowerQuery.includes(key)) {
                foundStations.push(value);
            }
        }
        
        return foundStations.length > 0 ? foundStations : ['Union Station', 'Bloor Station'];
    }

    /**
     * Generate mock schedule data
     */
    generateSchedules() {
        const schedules = [];
        const now = new Date();
        
        for (let i = 0; i < 3; i++) {
            const departureTime = new Date(now.getTime() + (i * 30 + 15) * 60000);
            const arrivalTime = new Date(departureTime.getTime() + 45 * 60000);
            
            schedules.push({
                departure: departureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                }),
                arrival: arrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                }),
                duration: '45 minutes',
                line: 'Lakeshore East Line',
                platform: Math.floor(Math.random() * 8) + 1,
                status: Math.random() > 0.8 ? 'Delayed 5 min' : 'On Time'
            });
        }
        
        return schedules;
    }

    /**
     * Generate mock route data
     */
    generateRoute() {
        return {
            totalTime: '1 hour 15 minutes',
            transfers: 1,
            steps: [
                'Board GO Train at Union Station',
                'Travel eastbound for 45 minutes',
                'Transfer at Bloor Station',
                'Take Line 2 subway eastbound',
                'Arrive at Kennedy Station'
            ]
        };
    }

    /**
     * Generate mock fare data
     */
    generateFares() {
        return {
            adult: '$5.50',
            senior: '$4.25',
            student: '$4.25',
            child: '$2.75'
        };
    }

    /**
     * Check if query is non-transit related
     */
    isNonTransitQuery(text) {
        const nonTransitKeywords = [
            // Music/Entertainment
            'play', 'music', 'song', 'artist', 'album', 'spotify', 'youtube',
            // General questions
            'weather', 'news', 'joke', 'story', 'recipe', 'movie', 'tv show',
            // Other services
            'call', 'text', 'email', 'search', 'google', 'internet',
            // Personal requests
            'remind me', 'set alarm', 'calendar', 'appointment'
        ];
        
        const lowerText = text.toLowerCase();
        return nonTransitKeywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Provide helpful response for non-transit queries
     */
    getNonTransitResponse(query, language = 'en') {
        const responses = {
            'en': {
                message: "I'm a transit assistant for Metrolinx services.",
                suggestion: "I can help you with train schedules, service status, routes, and fares. Try asking: 'What time is the next train?' or 'How much does a ticket cost?'"
            },
            'fr': {
                message: "Je suis un assistant de transport pour les services Metrolinx.",
                suggestion: "Je peux vous aider avec les horaires de train, l'état du service, les itinéraires et les tarifs. Essayez de demander: 'À quelle heure est le prochain train?' ou 'Combien coûte un billet?'"
            },
            'zh': {
                message: "我是Metrolinx服务的交通助手。",
                suggestion: "我可以帮助您查询火车时刻表、服务状态、路线和票价。请尝试询问：'下一班火车几点？'或'票价多少钱？'"
            }
        };

        const response = responses[language] || responses['en'];
        
        return {
            type: 'help',
            data: {
                message: response.message,
                suggestion: response.suggestion,
                examples: this.getExampleQueries(language)
            }
        };
    }

    /**
     * Get example queries for each language
     */
    getExampleQueries(language = 'en') {
        const examples = {
            'en': [
                "What time is the next train to Union Station?",
                "How much does a ticket cost?",
                "Are there any delays on the GO Train?",
                "How do I get from Bloor to Kennedy Station?"
            ],
            'fr': [
                "À quelle heure est le prochain train pour Union Station?",
                "Combien coûte un billet?",
                "Y a-t-il des retards sur le GO Train?",
                "Comment aller de Bloor à Kennedy Station?"
            ],
            'zh': [
                "下一班去联合车站的火车几点？",
                "票价多少钱？",
                "GO列车有延误吗？",
                "从布洛尔站到肯尼迪站怎么走？"
            ]
        };

        return examples[language] || examples['en'];
    }

    /**
     * Utility method to add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
window.MetrolinxAPI = MetrolinxAPI;
