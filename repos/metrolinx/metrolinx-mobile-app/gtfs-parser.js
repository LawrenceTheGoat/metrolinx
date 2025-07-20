/**
 * GTFS Parser for GO Transit Real-Time Schedule Data
 * Parses actual Metrolinx GTFS data to provide real schedule information
 */

class GTFSParser {
    constructor() {
        this.stops = new Map();
        this.routes = new Map();
        this.stopTimes = [];
        this.trips = new Map();
        this.isLoaded = false;
        this.stationAliases = new Map();
        this.initializeStationAliases();
    }

    /**
     * Initialize station name aliases for better voice recognition
     * Includes English, Chinese translations, and phonetic pronunciations
     */
    initializeStationAliases() {
        // Common station name variations and aliases
        const aliases = {
            // Union Station variations (English + Chinese)
            'union': 'UN',
            'union station': 'UN',
            'downtown': 'UN',
            'toronto union': 'UN',
            // Chinese translations for Union
            '联合': 'UN',
            '联合站': 'UN',
            '联合车站': 'UN',
            '市中心': 'UN',
            '多伦多联合': 'UN',
            '多伦多联合站': 'UN',
            // Chinese phonetic pronunciations
            '尤尼恩': 'UN',
            '优尼恩': 'UN',
            '由尼恩': 'UN',
            
            // Oriole variations (English + Chinese)
            'oriole': 'OR',
            'oriole station': 'OR',
            'oriole go': 'OR',
            // Chinese translations for Oriole
            '金莺': 'OR',
            '金莺站': 'OR',
            '金莺车站': 'OR',
            '奥里奥尔': 'OR',
            '奥里奥尔站': 'OR',
            // Chinese phonetic pronunciations
            '奥瑞欧': 'OR',
            '欧瑞欧': 'OR',
            '奥里欧': 'OR',
            
            // Bloor Station (English + Chinese)
            'bloor': 'BL',
            'bloor station': 'BL',
            'bloor go': 'BL',
            'dundas west': 'BL',
            // Chinese for Bloor
            '布洛尔': 'BL',
            '布洛尔站': 'BL',
            '布鲁尔': 'BL',
            '布鲁尔站': 'BL',
            
            // Kennedy Station (English + Chinese)
            'kennedy': 'KE',
            'kennedy station': 'KE',
            // Chinese for Kennedy
            '肯尼迪': 'KE',
            '肯尼迪站': 'KE',
            '肯尼地': 'KE',
            
            // Scarborough (English + Chinese)
            'scarborough': 'SC',
            'scarborough go': 'SC',
            // Chinese for Scarborough
            '士嘉堡': 'SC',
            '士嘉堡站': 'SC',
            '斯卡伯勒': 'SC',
            '斯卡伯勒站': 'SC',
            
            // Ajax (English + Chinese)
            'ajax': 'AJ',
            'ajax go': 'AJ',
            // Chinese for Ajax
            '阿贾克斯': 'AJ',
            '阿贾克斯站': 'AJ',
            '埃阿斯': 'AJ',
            
            // Pickering (English + Chinese)
            'pickering': 'PIN',
            'pickering go': 'PIN',
            // Chinese for Pickering
            '皮克林': 'PIN',
            '皮克林站': 'PIN',
            '匹克林': 'PIN',
            
            // Whitby (English + Chinese)
            'whitby': 'WH',
            'whitby go': 'WH',
            // Chinese for Whitby
            '惠特比': 'WH',
            '惠特比站': 'WH',
            '怀特比': 'WH',
            
            // Oshawa (English + Chinese)
            'oshawa': 'OS',
            'oshawa go': 'OS',
            'durham college': 'OS',
            // Chinese for Oshawa
            '奥沙瓦': 'OS',
            '奥沙瓦站': 'OS',
            '奥沙华': 'OS',
            
            // Richmond Hill (English + Chinese)
            'richmond hill': 'RI',
            'richmond hill go': 'RI',
            // Chinese for Richmond Hill
            '列治文山': 'RI',
            '列治文山站': 'RI',
            '里士满山': 'RI',
            '里士满山站': 'RI',
            '列治文希尔': 'RI',
            
            // Langstaff (English + Chinese)
            'langstaff': 'LA',
            'langstaff go': 'LA',
            // Chinese for Langstaff
            '朗斯塔夫': 'LA',
            '朗斯塔夫站': 'LA',
            '兰斯塔夫': 'LA',
            
            // Aurora (English + Chinese)
            'aurora': 'AU',
            'aurora go': 'AU',
            // Chinese for Aurora
            '奥罗拉': 'AU',
            '奥罗拉站': 'AU',
            '极光': 'AU',
            '极光站': 'AU',
            '欧若拉': 'AU',
            
            // Newmarket (English + Chinese)
            'newmarket': 'NE',
            'newmarket go': 'NE',
            // Chinese for Newmarket
            '纽马克特': 'NE',
            '纽马克特站': 'NE',
            '新市场': 'NE',
            '新市场站': 'NE',
            
            // Bradford (English + Chinese)
            'bradford': 'BD',
            'bradford go': 'BD',
            // Chinese for Bradford
            '布拉德福德': 'BD',
            '布拉德福德站': 'BD',
            '布雷德福': 'BD',
            
            // Barrie (English + Chinese)
            'barrie': 'BA',
            'barrie south': 'BA',
            // Chinese for Barrie
            '巴里': 'BA',
            '巴里站': 'BA',
            '巴里南': 'BA',
            
            // Allandale (English + Chinese)
            'allandale': 'AD',
            'allandale waterfront': 'AD',
            // Chinese for Allandale
            '阿兰代尔': 'AD',
            '阿兰代尔站': 'AD',
            '阿兰代尔海滨': 'AD',
            
            // Milton (English + Chinese)
            'milton': 'ML',
            'milton go': 'ML',
            // Chinese for Milton
            '米尔顿': 'ML',
            '米尔顿站': 'ML',
            '密尔顿': 'ML',
            
            // Georgetown (English + Chinese)
            'georgetown': 'GE',
            'georgetown go': 'GE',
            // Chinese for Georgetown
            '乔治敦': 'GE',
            '乔治敦站': 'GE',
            '佐治城': 'GE',
            
            // Guelph (English + Chinese)
            'guelph': 'GL',
            'guelph central': 'GL',
            // Chinese for Guelph
            '圭尔夫': 'GL',
            '圭尔夫站': 'GL',
            '贵湖': 'GL',
            '贵湖站': 'GL',
            
            // Kitchener (English + Chinese)
            'kitchener': 'KI',
            'kitchener go': 'KI',
            // Chinese for Kitchener
            '基奇纳': 'KI',
            '基奇纳站': 'KI',
            '滑铁卢': 'KI',
            '基秦拿': 'KI',
            
            // Brampton/Bramalea (English + Chinese)
            'brampton': 'BE',
            'bramalea': 'BE',
            // Chinese for Brampton
            '布兰普顿': 'BE',
            '布兰普顿站': 'BE',
            '宾顿': 'BE',
            '宾顿站': 'BE',
            '布拉马利亚': 'BE',
            
            // Malton (English + Chinese)
            'malton': 'MA',
            'malton go': 'MA',
            // Chinese for Malton
            '马尔顿': 'MA',
            '马尔顿站': 'MA',
            '莫尔顿': 'MA',
            
            // Pearson Airport (English + Chinese)
            'pearson': 'PA',
            'pearson airport': 'PA',
            'airport': 'PA',
            // Chinese for Pearson Airport
            '皮尔逊': 'PA',
            '皮尔逊机场': 'PA',
            '机场': 'PA',
            '多伦多机场': 'PA',
            '皮尔森机场': 'PA',
            
            // Etobicoke North (English + Chinese)
            'etobicoke north': 'ET',
            // Chinese for Etobicoke
            '怡陶碧谷': 'ET',
            '怡陶碧谷北': 'ET',
            '伊桃碧谷': 'ET',
            '伊桃碧谷北': 'ET',
            
            // Weston (English + Chinese)
            'weston': 'WE',
            // Chinese for Weston
            '韦斯顿': 'WE',
            '韦斯顿站': 'WE',
            '威斯顿': 'WE',
            
            // Kipling (English + Chinese)
            'kipling': 'KP',
            'kipling go': 'KP',
            // Chinese for Kipling
            '基普林': 'KP',
            '基普林站': 'KP',
            '吉卜林': 'KP',
            
            // Long Branch (English + Chinese)
            'long branch': 'LO',
            'long branch go': 'LO',
            // Chinese for Long Branch
            '长枝': 'LO',
            '长枝站': 'LO',
            '朗布兰奇': 'LO',
            
            // Mimico (English + Chinese)
            'mimico': 'MI',
            'mimico go': 'MI',
            // Chinese for Mimico
            '米米科': 'MI',
            '米米科站': 'MI',
            '美美高': 'MI',
            
            // Exhibition (English + Chinese)
            'exhibition': 'EX',
            'exhibition go': 'EX',
            // Chinese for Exhibition
            '展览': 'EX',
            '展览站': 'EX',
            '展览场': 'EX',
            
            // Port Credit (English + Chinese)
            'port credit': 'PO',
            'port credit go': 'PO',
            // Chinese for Port Credit
            '宝港': 'PO',
            '宝港站': 'PO',
            '港口信贷': 'PO',
            '波特信贷': 'PO',
            
            // Clarkson (English + Chinese)
            'clarkson': 'CL',
            'clarkson go': 'CL',
            // Chinese for Clarkson
            '克拉克森': 'CL',
            '克拉克森站': 'CL',
            '嘉逊': 'CL',
            
            // Oakville (English + Chinese)
            'oakville': 'OA',
            'oakville go': 'OA',
            // Chinese for Oakville
            '奥克维尔': 'OA',
            '奥克维尔站': 'OA',
            '橡树镇': 'OA',
            '橡树镇站': 'OA',
            
            // Bronte (English + Chinese)
            'bronte': 'BO',
            'bronte go': 'BO',
            // Chinese for Bronte
            '布朗特': 'BO',
            '布朗特站': 'BO',
            '勃朗特': 'BO',
            
            // Appleby (English + Chinese)
            'appleby': 'AP',
            'appleby go': 'AP',
            // Chinese for Appleby
            '阿普尔比': 'AP',
            '阿普尔比站': 'AP',
            '苹果比': 'AP',
            
            // Burlington (English + Chinese)
            'burlington': 'BU',
            'burlington go': 'BU',
            // Chinese for Burlington
            '伯灵顿': 'BU',
            '伯灵顿站': 'BU',
            '布灵顿': 'BU',
            
            // Aldershot (English + Chinese)
            'aldershot': 'AL',
            'aldershot go': 'AL',
            // Chinese for Aldershot
            '奥德肖特': 'AL',
            '奥德肖特站': 'AL',
            '阿尔德肖特': 'AL',
            
            // Hamilton (English + Chinese)
            'hamilton': 'HA',
            'hamilton go': 'HA',
            // Chinese for Hamilton
            '汉密尔顿': 'HA',
            '汉密尔顿站': 'HA',
            '咸美顿': 'HA',
            
            // West Harbour (English + Chinese)
            'west harbour': 'WR',
            'west harbour go': 'WR',
            // Chinese for West Harbour
            '西港': 'WR',
            '西港站': 'WR',
            '西海港': 'WR',
            
            // St. Catharines (English + Chinese)
            'st catharines': 'SCTH',
            // Chinese for St. Catharines
            '圣凯瑟琳': 'SCTH',
            '圣凯瑟琳站': 'SCTH',
            '圣嘉芙莲': 'SCTH',
            
            // Niagara Falls (English + Chinese)
            'niagara falls': 'NI',
            // Chinese for Niagara Falls
            '尼亚加拉瀑布': 'NI',
            '尼亚加拉瀑布站': 'NI',
            '尼加拉瀑布': 'NI'
        };

        for (const [alias, stationCode] of Object.entries(aliases)) {
            this.stationAliases.set(alias.toLowerCase(), stationCode);
        }
    }

    /**
     * Load GTFS data from files
     */
    async loadGTFSData() {
        try {
            console.log('Loading GTFS data...');
            
            // Determine the correct path based on current location
            this.gtfsBasePath = this.determineGTFSPath();
            console.log('Using GTFS path:', this.gtfsBasePath);
            
            // Load stops data
            await this.loadStops();
            
            // Load routes data
            await this.loadRoutes();
            
            // Load trips data
            await this.loadTrips();
            
            // Load stop times data (this is the largest file)
            await this.loadStopTimes();
            
            this.isLoaded = true;
            console.log('GTFS data loaded successfully');
            console.log(`Loaded ${this.stops.size} stops, ${this.routes.size} routes, ${this.stopTimes.length} stop times`);
            
        } catch (error) {
            console.error('Error loading GTFS data:', error);
            throw error;
        }
    }

    /**
     * Determine the correct path to GTFS files based on current location
     */
    determineGTFSPath() {
        // For the mobile app served from its own directory, use local path
        return '/GO-GTFS';
    }

    /**
     * Load stops data
     */
    async loadStops() {
        const response = await fetch(`${this.gtfsBasePath}/stops.txt`);
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const stop = {};
                headers.forEach((header, index) => {
                    stop[header] = values[index] || '';
                });
                this.stops.set(stop.stop_id, stop);
            }
        }
    }

    /**
     * Load routes data
     */
    async loadRoutes() {
        const response = await fetch(`${this.gtfsBasePath}/routes.txt`);
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const route = {};
                headers.forEach((header, index) => {
                    route[header] = values[index] || '';
                });
                this.routes.set(route.route_id, route);
            }
        }
    }

    /**
     * Load trips data
     */
    async loadTrips() {
        const response = await fetch(`${this.gtfsBasePath}/trips.txt`);
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const trip = {};
                headers.forEach((header, index) => {
                    trip[header] = values[index] || '';
                });
                this.trips.set(trip.trip_id, trip);
            }
        }
    }

    /**
     * Load stop times data
     */
    async loadStopTimes() {
        const response = await fetch(`${this.gtfsBasePath}/stop_times.txt`);
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const stopTime = {};
                headers.forEach((header, index) => {
                    stopTime[header] = values[index] || '';
                });
                this.stopTimes.push(stopTime);
            }
        }
        
        // Sort stop times by trip_id and stop_sequence for efficient searching
        this.stopTimes.sort((a, b) => {
            if (a.trip_id !== b.trip_id) {
                return a.trip_id.localeCompare(b.trip_id);
            }
            return parseInt(a.stop_sequence) - parseInt(b.stop_sequence);
        });
    }

    /**
     * Parse CSV line handling quoted fields
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Find station by name or alias with fuzzy matching for pronunciation variations
     */
    findStation(stationName) {
        const searchName = stationName.toLowerCase().trim();
        
        // First try exact alias match
        if (this.stationAliases.has(searchName)) {
            const stationCode = this.stationAliases.get(searchName);
            return this.stops.get(stationCode);
        }
        
        // Try fuzzy matching for common mispronunciations
        const fuzzyMatch = this.findFuzzyMatch(searchName);
        if (fuzzyMatch) {
            return fuzzyMatch;
        }
        
        // Try partial matches in station names
        for (const [stopId, stop] of this.stops) {
            const stopName = stop.stop_name.toLowerCase();
            if (stopName.includes(searchName) || searchName.includes(stopName.split(' ')[0])) {
                return stop;
            }
        }
        
        return null;
    }

    /**
     * Find fuzzy matches for common mispronunciations
     */
    findFuzzyMatch(searchName) {
        // Common mispronunciations and their corrections
        const fuzzyMappings = {
            'oreo': 'oriole',
            'oriel': 'oriole',
            'aureole': 'oriole',
            'oral': 'oriole',
            'oreal': 'oriole',
            'scarboro': 'scarborough',
            'scarburg': 'scarborough',
            'scarbro': 'scarborough',
            'union': 'union station',
            'downtown': 'union station',
            'center': 'union station',
            'centre': 'union station',
            'ajax': 'ajax go',
            'pickering': 'pickering go',
            'whitby': 'whitby go',
            'oshawa': 'oshawa go',
            'richmond': 'richmond hill',
            'richmond hill': 'richmond hill go',
            'aurora': 'aurora go',
            'newmarket': 'newmarket go',
            'bradford': 'bradford go',
            'barrie': 'barrie south',
            'milton': 'milton go',
            'georgetown': 'georgetown go',
            'guelph': 'guelph central',
            'kitchener': 'kitchener go',
            'brampton': 'bramalea',
            'airport': 'pearson airport',
            'pearson': 'pearson airport',
            'hamilton': 'hamilton go',
            'burlington': 'burlington go',
            'oakville': 'oakville go',
            'mississauga': 'port credit',
            'etobicoke': 'etobicoke north',
            'weston': 'weston go',
            'bloor': 'bloor go',
            'kipling': 'kipling go',
            'mimico': 'mimico go',
            'exhibition': 'exhibition go',
            'long branch': 'long branch go',
            'clarkson': 'clarkson go',
            'port credit': 'port credit go',
            'appleby': 'appleby go',
            'aldershot': 'aldershot go'
        };

        // Check for fuzzy matches
        for (const [mispronunciation, correction] of Object.entries(fuzzyMappings)) {
            if (this.calculateSimilarity(searchName, mispronunciation) > 0.7) {
                // Try to find the corrected version
                if (this.stationAliases.has(correction)) {
                    const stationCode = this.stationAliases.get(correction);
                    return this.stops.get(stationCode);
                }
                
                // Try partial match with correction
                for (const [stopId, stop] of this.stops) {
                    const stopName = stop.stop_name.toLowerCase();
                    if (stopName.includes(correction) || correction.includes(stopName.split(' ')[0])) {
                        return stop;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Calculate similarity between two strings using Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
        
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }

    /**
     * Get schedule between two stations
     */
    getSchedule(fromStation, toStation, options = {}) {
        if (!this.isLoaded) {
            throw new Error('GTFS data not loaded. Call loadGTFSData() first.');
        }

        const fromStop = this.findStation(fromStation);
        const toStop = this.findStation(toStation);

        if (!fromStop) {
            throw new Error(`Station not found: ${fromStation}`);
        }

        if (!toStop) {
            throw new Error(`Station not found: ${toStation}`);
        }

        console.log(`Finding schedule from ${fromStop.stop_name} (${fromStop.stop_id}) to ${toStop.stop_name} (${toStop.stop_id})`);

        // Find trips that serve both stations
        const validTrips = this.findTripsServingBothStations(fromStop.stop_id, toStop.stop_id);
        
        // Get current time for filtering
        const now = new Date();
        const currentTime = this.formatTime(now);
        const currentDate = this.formatDate(now);
        
        // Filter and format results
        const schedules = [];
        
        for (const trip of validTrips) {
            const fromStopTime = trip.fromStopTime;
            const toStopTime = trip.toStopTime;
            
            // Skip past departures (unless looking for next day)
            if (this.isTimeAfter(fromStopTime.departure_time, currentTime) || options.includeAll) {
                const route = this.routes.get(trip.route_id);
                const tripInfo = this.trips.get(trip.trip_id);
                
                schedules.push({
                    tripId: trip.trip_id,
                    routeName: route ? route.route_long_name : 'Unknown Route',
                    routeShortName: route ? route.route_short_name : '',
                    departureTime: fromStopTime.departure_time,
                    arrivalTime: toStopTime.arrival_time,
                    fromStation: fromStop.stop_name,
                    toStation: toStop.stop_name,
                    duration: this.calculateDuration(fromStopTime.departure_time, toStopTime.arrival_time),
                    headsign: toStopTime.stop_headsign || tripInfo?.trip_headsign || ''
                });
            }
        }
        
        // Sort by departure time
        schedules.sort((a, b) => this.compareTime(a.departureTime, b.departureTime));
        
        // Return next few departures
        return schedules.slice(0, options.limit || 5);
    }

    /**
     * Find trips that serve both stations in the correct order
     */
    findTripsServingBothStations(fromStopId, toStopId) {
        const tripMap = new Map();
        
        // Group stop times by trip
        for (const stopTime of this.stopTimes) {
            if (!tripMap.has(stopTime.trip_id)) {
                tripMap.set(stopTime.trip_id, []);
            }
            tripMap.get(stopTime.trip_id).push(stopTime);
        }
        
        const validTrips = [];
        
        for (const [tripId, stopTimes] of tripMap) {
            let fromStopTime = null;
            let toStopTime = null;
            
            // Find both stations in this trip
            for (const stopTime of stopTimes) {
                if (stopTime.stop_id === fromStopId) {
                    fromStopTime = stopTime;
                }
                if (stopTime.stop_id === toStopId) {
                    toStopTime = stopTime;
                }
            }
            
            // Check if both stations are served and in correct order
            if (fromStopTime && toStopTime && 
                parseInt(fromStopTime.stop_sequence) < parseInt(toStopTime.stop_sequence)) {
                
                const trip = this.trips.get(tripId);
                validTrips.push({
                    trip_id: tripId,
                    route_id: trip ? trip.route_id : '',
                    fromStopTime: fromStopTime,
                    toStopTime: toStopTime
                });
            }
        }
        
        return validTrips;
    }

    /**
     * Check if time1 is after time2
     */
    isTimeAfter(time1, time2) {
        const t1 = this.timeToMinutes(time1);
        const t2 = this.timeToMinutes(time2);
        return t1 > t2;
    }

    /**
     * Compare two times
     */
    compareTime(time1, time2) {
        return this.timeToMinutes(time1) - this.timeToMinutes(time2);
    }

    /**
     * Convert time string to minutes since midnight
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours % 24) * 60 + minutes;
    }

    /**
     * Calculate duration between two times
     */
    calculateDuration(startTime, endTime) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const durationMinutes = endMinutes - startMinutes;
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Format current time as HH:MM:SS
     */
    formatTime(date) {
        return date.toTimeString().split(' ')[0];
    }

    /**
     * Format current date as YYYYMMDD
     */
    formatDate(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    /**
     * Get next departures from a station
     */
    getNextDepartures(stationName, options = {}) {
        if (!this.isLoaded) {
            throw new Error('GTFS data not loaded. Call loadGTFSData() first.');
        }

        const station = this.findStation(stationName);
        if (!station) {
            throw new Error(`Station not found: ${stationName}`);
        }

        const now = new Date();
        const currentTime = this.formatTime(now);
        const departures = [];

        // Find all stop times for this station
        for (const stopTime of this.stopTimes) {
            if (stopTime.stop_id === station.stop_id) {
                // Skip past departures
                if (this.isTimeAfter(stopTime.departure_time, currentTime) || options.includeAll) {
                    const trip = this.trips.get(stopTime.trip_id);
                    const route = trip ? this.routes.get(trip.route_id) : null;
                    
                    departures.push({
                        departureTime: stopTime.departure_time,
                        routeName: route ? route.route_long_name : 'Unknown Route',
                        routeShortName: route ? route.route_short_name : '',
                        headsign: stopTime.stop_headsign || trip?.trip_headsign || '',
                        tripId: stopTime.trip_id
                    });
                }
            }
        }

        // Sort by departure time and return next few
        departures.sort((a, b) => this.compareTime(a.departureTime, b.departureTime));
        return departures.slice(0, options.limit || 10);
    }

    /**
     * Search for stations by name
     */
    searchStations(query) {
        const searchQuery = query.toLowerCase().trim();
        const results = [];

        for (const [stopId, stop] of this.stops) {
            const stopName = stop.stop_name.toLowerCase();
            if (stopName.includes(searchQuery)) {
                results.push({
                    id: stopId,
                    name: stop.stop_name,
                    lat: parseFloat(stop.stop_lat),
                    lon: parseFloat(stop.stop_lon)
                });
            }
        }

        return results.sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GTFSParser;
} else {
    window.GTFSParser = GTFSParser;
}
