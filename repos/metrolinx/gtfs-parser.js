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
     */
    initializeStationAliases() {
        // Common station name variations and aliases
        const aliases = {
            // Union Station variations
            'union': 'UN',
            'union station': 'UN',
            'downtown': 'UN',
            'toronto union': 'UN',
            
            // Oriole variations
            'oriole': 'OR',
            'oriole station': 'OR',
            'oriole go': 'OR',
            
            // Other common stations
            'bloor': 'BL',
            'bloor station': 'BL',
            'kennedy': 'KE',
            'kennedy station': 'KE',
            'scarborough': 'SC',
            'scarborough go': 'SC',
            'ajax': 'AJ',
            'ajax go': 'AJ',
            'pickering': 'PIN',
            'pickering go': 'PIN',
            'whitby': 'WH',
            'whitby go': 'WH',
            'oshawa': 'OS',
            'oshawa go': 'OS',
            'durham college': 'OS',
            'richmond hill': 'RI',
            'richmond hill go': 'RI',
            'langstaff': 'LA',
            'langstaff go': 'LA',
            'aurora': 'AU',
            'aurora go': 'AU',
            'newmarket': 'NE',
            'newmarket go': 'NE',
            'bradford': 'BD',
            'bradford go': 'BD',
            'barrie': 'BA',
            'barrie south': 'BA',
            'allandale': 'AD',
            'allandale waterfront': 'AD',
            'milton': 'ML',
            'milton go': 'ML',
            'georgetown': 'GE',
            'georgetown go': 'GE',
            'guelph': 'GL',
            'guelph central': 'GL',
            'kitchener': 'KI',
            'kitchener go': 'KI',
            'brampton': 'BE',
            'bramalea': 'BE',
            'malton': 'MA',
            'malton go': 'MA',
            'pearson': 'PA',
            'pearson airport': 'PA',
            'airport': 'PA',
            'etobicoke north': 'ET',
            'weston': 'WE',
            'bloor go': 'BL',
            'dundas west': 'BL',
            'kipling': 'KP',
            'kipling go': 'KP',
            'long branch': 'LO',
            'long branch go': 'LO',
            'mimico': 'MI',
            'mimico go': 'MI',
            'exhibition': 'EX',
            'exhibition go': 'EX',
            'port credit': 'PO',
            'port credit go': 'PO',
            'clarkson': 'CL',
            'clarkson go': 'CL',
            'oakville': 'OA',
            'oakville go': 'OA',
            'bronte': 'BO',
            'bronte go': 'BO',
            'appleby': 'AP',
            'appleby go': 'AP',
            'burlington': 'BU',
            'burlington go': 'BU',
            'aldershot': 'AL',
            'aldershot go': 'AL',
            'hamilton': 'HA',
            'hamilton go': 'HA',
            'west harbour': 'WR',
            'west harbour go': 'WR',
            'st catharines': 'SCTH',
            'niagara falls': 'NI'
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
        // Check if we're in a subdirectory (like metrolinx-mobile-app)
        const currentPath = window.location.pathname;
        if (currentPath.includes('/metrolinx-mobile-app/')) {
            return '../GO-GTFS';
        } else {
            return '/GO-GTFS';
        }
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
