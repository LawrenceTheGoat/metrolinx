/**
 * Real GTFS API Handler
 * Integrates with actual GO Transit GTFS data for real schedule information
 */

class RealGTFSAPI {
    constructor() {
        this.gtfsParser = new GTFSParser();
        this.isInitialized = false;
    }

    /**
     * Initialize the GTFS data
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('Initializing Real GTFS API...');
            await this.gtfsParser.loadGTFSData();
            this.isInitialized = true;
            console.log('Real GTFS API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize GTFS API:', error);
            throw error;
        }
    }

    /**
     * Parse voice query to extract stations and intent
     */
    parseVoiceQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Common patterns for schedule queries
        const patterns = [
            // "from X to Y" pattern
            /(?:from|leaving)\s+(.+?)\s+(?:to|going to|bound for)\s+(.+?)(?:\s|$)/i,
            // "X to Y" pattern
            /(.+?)\s+(?:to|going to)\s+(.+?)(?:\s|$)/i,
            // "schedule from X to Y"
            /schedule\s+(?:from\s+)?(.+?)\s+(?:to|going to)\s+(.+?)(?:\s|$)/i,
            // "train from X to Y"
            /train\s+(?:from\s+)?(.+?)\s+(?:to|going to)\s+(.+?)(?:\s|$)/i
        ];

        for (const pattern of patterns) {
            const match = lowerQuery.match(pattern);
            if (match) {
                return {
                    type: 'schedule',
                    fromStation: match[1].trim(),
                    toStation: match[2].trim()
                };
            }
        }

        // Check for departure queries
        const departurePatterns = [
            /(?:next|upcoming)\s+(?:trains?|departures?)\s+(?:from\s+)?(.+?)(?:\s|$)/i,
            /(?:when|what time)\s+(?:is|are)\s+(?:the\s+)?(?:next\s+)?(?:trains?|departures?)\s+(?:from\s+)?(.+?)(?:\s|$)/i,
            /departures?\s+(?:from\s+)?(.+?)(?:\s|$)/i
        ];

        for (const pattern of departurePatterns) {
            const match = lowerQuery.match(pattern);
            if (match) {
                return {
                    type: 'departures',
                    station: match[1].trim()
                };
            }
        }

        // Check for general station info
        if (lowerQuery.includes('station') || lowerQuery.includes('stop')) {
            return {
                type: 'station_info',
                query: query
            };
        }

        return {
            type: 'unknown',
            query: query
        };
    }

    /**
     * Process voice query and return schedule information
     */
    async processVoiceQuery(query) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const parsedQuery = this.parseVoiceQuery(query);
        
        try {
            switch (parsedQuery.type) {
                case 'schedule':
                    return await this.getScheduleInfo(parsedQuery.fromStation, parsedQuery.toStation);
                
                case 'departures':
                    return await this.getDepartureInfo(parsedQuery.station);
                
                case 'station_info':
                    return await this.getStationInfo(parsedQuery.query);
                
                default:
                    return this.getHelpResponse();
            }
        } catch (error) {
            console.error('Error processing voice query:', error);
            return this.getErrorResponse(error.message);
        }
    }

    /**
     * Get schedule information between two stations
     */
    async getScheduleInfo(fromStation, toStation) {
        try {
            const schedules = this.gtfsParser.getSchedule(fromStation, toStation, { limit: 3 });
            
            if (schedules.length === 0) {
                return {
                    success: false,
                    message: `Sorry, I couldn't find any direct trains from ${fromStation} to ${toStation}. You might need to transfer at Union Station or another hub.`,
                    type: 'no_schedule'
                };
            }

            const nextTrain = schedules[0];
            let response = `The next train from ${nextTrain.fromStation} to ${nextTrain.toStation} `;
            response += `departs at ${this.formatTime(nextTrain.departureTime)} `;
            response += `and arrives at ${this.formatTime(nextTrain.arrivalTime)}. `;
            response += `Travel time is ${nextTrain.duration} on the ${nextTrain.routeName} line.`;

            if (schedules.length > 1) {
                response += ` The following train departs at ${this.formatTime(schedules[1].departureTime)}.`;
            }

            return {
                success: true,
                message: response,
                type: 'schedule',
                data: {
                    schedules: schedules,
                    fromStation: nextTrain.fromStation,
                    toStation: nextTrain.toStation
                }
            };

        } catch (error) {
            if (error.message.includes('Station not found')) {
                return {
                    success: false,
                    message: `I couldn't find one of the stations you mentioned. Please try saying the full station name, like "Union Station" or "Oriole GO".`,
                    type: 'station_not_found'
                };
            }
            throw error;
        }
    }

    /**
     * Get departure information from a station
     */
    async getDepartureInfo(stationName) {
        try {
            const departures = this.gtfsParser.getNextDepartures(stationName, { limit: 5 });
            
            if (departures.length === 0) {
                return {
                    success: false,
                    message: `Sorry, I couldn't find any upcoming departures from ${stationName}. Please check if the station name is correct.`,
                    type: 'no_departures'
                };
            }

            const station = this.gtfsParser.findStation(stationName);
            let response = `Next departures from ${station.stop_name}: `;
            
            const nextThree = departures.slice(0, 3);
            const departureList = nextThree.map(dep => {
                const time = this.formatTime(dep.departureTime);
                const route = dep.routeShortName || dep.routeName;
                return `${time} on ${route}`;
            }).join(', ');

            response += departureList + '.';

            return {
                success: true,
                message: response,
                type: 'departures',
                data: {
                    station: station.stop_name,
                    departures: departures
                }
            };

        } catch (error) {
            if (error.message.includes('Station not found')) {
                return {
                    success: false,
                    message: `I couldn't find the station "${stationName}". Please try the full station name, like "Union Station" or "Scarborough GO".`,
                    type: 'station_not_found'
                };
            }
            throw error;
        }
    }

    /**
     * Get station information
     */
    async getStationInfo(query) {
        const stations = this.gtfsParser.searchStations(query);
        
        if (stations.length === 0) {
            return {
                success: false,
                message: `I couldn't find any stations matching "${query}". Try saying a GO Transit station name like "Union Station" or "Mississauga".`,
                type: 'no_stations_found'
            };
        }

        if (stations.length === 1) {
            const station = stations[0];
            return {
                success: true,
                message: `I found ${station.name}. You can ask me about schedules from this station or to other destinations.`,
                type: 'station_info',
                data: { station: station }
            };
        }

        const stationNames = stations.slice(0, 3).map(s => s.name).join(', ');
        return {
            success: true,
            message: `I found several stations: ${stationNames}. Which one would you like information about?`,
            type: 'multiple_stations',
            data: { stations: stations.slice(0, 5) }
        };
    }

    /**
     * Get help response
     */
    getHelpResponse() {
        return {
            success: true,
            message: `I can help you with GO Transit schedules! Try asking: "When is the next train from Union Station to Oriole?" or "What are the next departures from Scarborough GO?"`,
            type: 'help'
        };
    }

    /**
     * Get error response
     */
    getErrorResponse(errorMessage) {
        return {
            success: false,
            message: `Sorry, I encountered an error: ${errorMessage}. Please try asking about GO Transit schedules in a different way.`,
            type: 'error'
        };
    }

    /**
     * Format time for speech (remove seconds, convert to 12-hour format)
     */
    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Get service status (placeholder for future real-time data)
     */
    async getServiceStatus() {
        return {
            success: true,
            message: "GO Transit services are operating normally. For real-time updates, please check the GO Transit app or website.",
            type: 'service_status'
        };
    }

    /**
     * Get fare information (basic implementation)
     */
    async getFareInfo(fromStation, toStation) {
        return {
            success: true,
            message: "For current fare information, please check the GO Transit website or app. Fares vary based on distance and payment method.",
            type: 'fare_info'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealGTFSAPI;
} else {
    window.RealGTFSAPI = RealGTFSAPI;
}
