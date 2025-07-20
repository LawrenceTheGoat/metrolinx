# Real Metrolinx Data Integration Guide

## Current Status: Mock Data vs Real Data

### 🎭 **Current Implementation (Mock Data)**
The current Voice Transit Assistant uses **simulated/mock data** for demonstration purposes:

- **Fake schedules**: Random departure/arrival times generated in real-time
- **Mock delays**: Randomly generated "Delayed 5 min" or "On Time" statuses
- **Simulated routes**: Generic route information
- **Static fares**: Hardcoded pricing ($5.50 adult, $4.25 senior, etc.)

### 🚂 **Real Data Integration (Available)**
Metrolinx provides several APIs for **real-time transit data**:

## Available Metrolinx APIs

### 1. **GTFS Real-Time Feed** (Primary)
- **URL**: `https://api.openmetrolinx.com/OpenDataAPI/api/V1/Gtfs.pb`
- **Format**: Protocol Buffers (GTFS-RT)
- **Data**: Real-time vehicle positions, trip updates, service alerts
- **Update Frequency**: Every 30 seconds
- **Authentication**: API Key required

### 2. **GTFS Static Data**
- **URL**: `https://www.gotransit.com/static_files/gotransit/assets/Files/GO_GTFS.zip`
- **Format**: ZIP file with CSV files
- **Data**: Routes, stops, schedules, calendar information
- **Update Frequency**: Weekly/Monthly

### 3. **Service Alerts API**
- **URL**: `https://api.openmetrolinx.com/OpenDataAPI/api/V1/ServiceAlerts`
- **Format**: JSON
- **Data**: Service disruptions, delays, planned maintenance
- **Update Frequency**: Real-time

### 4. **Trip Updates API**
- **URL**: `https://api.openmetrolinx.com/OpenDataAPI/api/V1/TripUpdates`
- **Format**: Protocol Buffers (GTFS-RT)
- **Data**: Real-time schedule deviations, delays
- **Update Frequency**: Every 30 seconds

### 5. **Vehicle Positions API**
- **URL**: `https://api.openmetrolinx.com/OpenDataAPI/api/V1/VehiclePositions`
- **Format**: Protocol Buffers (GTFS-RT)
- **Data**: Real-time vehicle locations and status
- **Update Frequency**: Every 30 seconds

## Implementation Steps

### Step 1: Get API Access

1. **Register for API Key**:
   - Visit: https://www.metrolinx.com/en/aboutus/opendata
   - Register for developer access
   - Obtain API key for authentication

2. **Review Terms of Service**:
   - Check usage limits and restrictions
   - Understand data licensing terms

### Step 2: Set Up Backend Server

The project includes a ready-to-use backend server (`backend-server.js`):

```bash
# Install dependencies
npm install

# Set your API key
export METROLINX_API_KEY="your_actual_api_key_here"

# Start the backend server
npm start
```

The server will run on `http://localhost:3001` and provide:
- `GET /api/schedules?from=union&to=bloor&language=en`
- `GET /api/status?language=zh`
- `GET /api/vehicles`
- `GET /api/health`

### Step 3: Update Frontend to Use Real Data

Modify `metrolinx-api.js` to use the backend server instead of mock data:

```javascript
// Replace the mock API calls with real backend calls
const API_BASE_URL = 'http://localhost:3001/api';

async processQuery(query) {
    const language = this.detectQueryLanguage(query);
    
    if (this.isScheduleQuery(query, language)) {
        const response = await fetch(`${API_BASE_URL}/schedules?language=${language}`);
        return await response.json();
    }
    
    if (this.isStatusQuery(query, language)) {
        const response = await fetch(`${API_BASE_URL}/status?language=${language}`);
        return await response.json();
    }
    
    // ... other query types
}
```

### Step 4: Handle GTFS-RT Data

The backend server includes protobuf parsing for GTFS-RT data:

```javascript
// Example of processing real trip updates
function processScheduleData(gtfsData, fromStation, toStation, language) {
    const schedules = [];
    
    gtfsData.entity.forEach(entity => {
        if (entity.tripUpdate) {
            const trip = entity.tripUpdate;
            
            // Extract real departure/arrival times
            trip.stopTimeUpdate.forEach(stopUpdate => {
                if (stopUpdate.stopId === fromStationId) {
                    const departure = new Date(stopUpdate.departure.time * 1000);
                    const delay = stopUpdate.departure.delay || 0;
                    
                    schedules.push({
                        departure: departure.toLocaleTimeString(),
                        delay: delay > 0 ? `Delayed ${Math.floor(delay/60)} min` : 'On Time',
                        tripId: trip.trip.tripId,
                        routeId: trip.trip.routeId,
                        isRealTime: true
                    });
                }
            });
        }
    });
    
    return schedules;
}
```

## Data Processing Examples

### Real Schedule Data
```javascript
// Real GTFS-RT trip update processing
{
    "departure": "2:45 PM",      // Actual departure time
    "arrival": "3:30 PM",        // Calculated arrival time
    "delay": "Delayed 3 min",    // Real-time delay info
    "platform": "Platform 4",   // Actual platform assignment
    "tripId": "GO_1234_20250719", // Real trip identifier
    "vehicleId": "GO_5678",      // Real vehicle number
    "isRealTime": true,          // Indicates real data
    "lastUpdated": "2025-07-19T14:30:00Z"
}
```

### Real Service Alerts
```javascript
// Real service alert processing
{
    "type": "status",
    "data": {
        "status": "Minor delays on Lakeshore East due to signal issues",
        "alerts": [
            {
                "severity": "WARNING",
                "effect": "REDUCED_SERVICE",
                "cause": "TECHNICAL_PROBLEM",
                "description": "Signal issues at Pickering causing 5-10 minute delays",
                "affectedRoutes": ["Lakeshore East"],
                "activePeriod": {
                    "start": "2025-07-19T14:00:00Z",
                    "end": "2025-07-19T16:00:00Z"
                }
            }
        ],
        "isRealTime": true,
        "source": "Metrolinx Open Data API"
    }
}
```

## Benefits of Real Data Integration

### 1. **Accurate Information**
- ✅ Real departure/arrival times
- ✅ Actual delays and service disruptions
- ✅ Current platform assignments
- ✅ Live vehicle positions

### 2. **Enhanced User Experience**
- ✅ Trustworthy schedule information
- ✅ Proactive delay notifications
- ✅ Real-time service updates
- ✅ Accurate travel planning

### 3. **Professional Application**
- ✅ Production-ready data source
- ✅ Official Metrolinx integration
- ✅ Compliance with transit standards
- ✅ Scalable architecture

## Technical Requirements

### Backend Dependencies
```json
{
    "express": "^4.18.2",        // Web server framework
    "cors": "^2.8.5",            // Cross-origin requests
    "node-fetch": "^2.6.7",     // HTTP client
    "protobufjs": "^7.2.5"      // GTFS-RT protobuf parsing
}
```

### GTFS-RT Protobuf Schema
You'll need the GTFS-RT protobuf definition file:
```bash
# Download the official GTFS-RT protobuf schema
wget https://developers.google.com/transit/gtfs-realtime/gtfs-realtime.proto
```

### Environment Variables
```bash
# Required for real data
METROLINX_API_KEY=your_actual_api_key_here

# Optional configuration
CACHE_DURATION=30000          # 30 seconds
API_TIMEOUT=5000             # 5 seconds
LOG_LEVEL=info
```

## Testing Real Data Integration

### 1. **Start Backend Server**
```bash
npm start
# Server runs on http://localhost:3001
```

### 2. **Test API Endpoints**
```bash
# Test schedule endpoint
curl "http://localhost:3001/api/schedules?from=union&to=bloor&language=en"

# Test status endpoint
curl "http://localhost:3001/api/status?language=zh"

# Test health check
curl "http://localhost:3001/api/health"
```

### 3. **Verify Data Quality**
- Check that `isRealTime: true` in responses
- Verify timestamps are current
- Confirm delay information is realistic
- Test multilingual responses

## Fallback Strategy

The implementation includes automatic fallback to mock data:

```javascript
try {
    // Attempt to fetch real data
    const realData = await fetchRealMetrolinxData();
    return realData;
} catch (error) {
    console.error('Real API failed, using mock data:', error);
    // Automatically fall back to mock data
    return generateMockData();
}
```

This ensures the application continues working even if:
- API key is invalid
- Metrolinx API is temporarily unavailable
- Network connectivity issues occur
- Rate limits are exceeded

## Production Deployment

### 1. **Security Considerations**
- Store API keys in environment variables
- Use HTTPS for all API communications
- Implement rate limiting
- Add request authentication

### 2. **Performance Optimization**
- Cache frequently requested data
- Implement data compression
- Use CDN for static assets
- Monitor API usage and costs

### 3. **Monitoring and Logging**
- Track API response times
- Monitor error rates
- Log user interactions
- Set up alerts for service issues

## Current vs Real Data Comparison

| Feature | Mock Data (Current) | Real Data (Available) |
|---------|-------------------|---------------------|
| **Schedules** | Random times | Actual GO Train schedules |
| **Delays** | Random delays | Real-time delay information |
| **Service Status** | Generic status | Live service alerts |
| **Vehicle Positions** | Not available | Real-time vehicle tracking |
| **Platform Info** | Random platforms | Actual platform assignments |
| **Route Updates** | Static routes | Dynamic route changes |
| **Data Freshness** | Generated on request | Updated every 30 seconds |
| **Accuracy** | Demo purposes only | Production-grade accuracy |

## Next Steps

1. **Obtain Metrolinx API Key** - Register at their developer portal
2. **Install Backend Dependencies** - Run `npm install`
3. **Configure Environment** - Set `METROLINX_API_KEY`
4. **Test Integration** - Start backend and test endpoints
5. **Update Frontend** - Modify API calls to use real backend
6. **Deploy to Production** - Set up proper hosting and monitoring

The infrastructure is ready - you just need the API key to switch from mock data to real Metrolinx data!
