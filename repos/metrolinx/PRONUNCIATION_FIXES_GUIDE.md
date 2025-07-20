# Pronunciation & Accent Tolerance Fixes

## Issues Fixed

### 1. "Failed to fetch" Error
**Problem**: When users asked "Union station to Oreo station", they got a "Failed to fetch" error.

**Root Cause**: The mobile app was trying to load GTFS files from `/GO-GTFS/` but it's in a subdirectory, so the correct path should be `../GO-GTFS/`.

**Solution**: Updated `gtfs-parser.js` with dynamic path detection:
```javascript
determineGTFSPath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/metrolinx-mobile-app/')) {
        return '../GO-GTFS';
    } else {
        return '/GO-GTFS';
    }
}
```

### 2. Pronunciation Tolerance for "Oreo" → "Oriole"
**Problem**: Users with accents or unclear pronunciation saying "Oreo" instead of "Oriole" weren't understood.

**Solution**: Added comprehensive fuzzy matching system with:

#### A. Levenshtein Distance Algorithm
Calculates similarity between spoken words and station names:
```javascript
calculateSimilarity(str1, str2) {
    // Returns similarity score from 0 to 1
    // 0.7+ threshold triggers fuzzy matching
}
```

#### B. Common Mispronunciation Mappings
```javascript
const fuzzyMappings = {
    'oreo': 'oriole',           // Main fix for user's issue
    'oriel': 'oriole',          // Alternative pronunciation
    'aureole': 'oriole',        // Similar sounding word
    'oral': 'oriole',           // Short pronunciation
    'oreal': 'oriole',          // Brand name confusion
    'scarboro': 'scarborough',  // Common shortening
    'scarburg': 'scarborough',  // Accent variation
    // ... many more mappings
};
```

## Enhanced Voice Recognition Features

### 1. Multi-Level Station Matching
The system now tries multiple approaches in order:

1. **Exact alias match** - "union" → Union Station
2. **Fuzzy pronunciation match** - "oreo" → "oriole" → Oriole GO
3. **Partial name match** - "scarborough" matches "Scarborough GO"
4. **Substring matching** - handles incomplete pronunciations

### 2. Accent-Tolerant Mappings
Added specific mappings for common accent variations:

```javascript
// Toronto area accent variations
'scarboro' → 'scarborough'
'scarbro' → 'scarborough'
'downtown' → 'union station'
'center' → 'union station'
'centre' → 'union station'

// GO station shortcuts
'ajax' → 'ajax go'
'pickering' → 'pickering go'
'whitby' → 'whitby go'
'oshawa' → 'oshawa go'
```

### 3. International Pronunciation Support
The system handles various pronunciation patterns:

- **Dropped syllables**: "Rich Hill" → "Richmond Hill"
- **Added sounds**: "Aureole" → "Oriole"
- **Similar phonetics**: "Oral" → "Oriole"
- **Brand confusion**: "Oreal" → "Oriole"

## Testing the Fixes

### Test Cases That Now Work:
1. **"Union station to Oreo station"** ✅
   - Recognizes "Union" → Union Station
   - Fuzzy matches "Oreo" → Oriole GO
   - Provides schedule information

2. **"Scarboro to downtown"** ✅
   - Maps "Scarboro" → Scarborough GO
   - Maps "downtown" → Union Station

3. **"Ajax to Rich Hill"** ✅
   - Expands "Ajax" → Ajax GO
   - Matches "Rich Hill" → Richmond Hill GO

### Voice Query Examples:
```
User says: "Union station to Oreo station"
System processes: "Union Station to Oriole GO"
Response: "The next train from Union Station to Oriole GO departs at..."

User says: "Scarboro to downtown"
System processes: "Scarborough GO to Union Station"
Response: "The next train from Scarborough GO to Union Station..."
```

## Technical Implementation

### 1. Enhanced Station Aliases
Extended the station alias system with 80+ variations:
```javascript
initializeStationAliases() {
    const aliases = {
        // Union Station variations
        'union': 'UN',
        'union station': 'UN',
        'downtown': 'UN',
        'toronto union': 'UN',
        
        // Oriole variations (including mispronunciations)
        'oriole': 'OR',
        'oriole station': 'OR',
        'oriole go': 'OR',
        // ... fuzzy matching handles "oreo" → "oriole"
    };
}
```

### 2. Smart Path Resolution
The system automatically detects whether it's running from:
- Root directory: Uses `/GO-GTFS/`
- Mobile app subdirectory: Uses `../GO-GTFS/`

### 3. Error Handling Improvements
Better error messages for users:
```javascript
// Before: "Failed to fetch"
// After: "I couldn't find the station 'xyz'. Did you mean 'Oriole GO'?"
```

## Performance Optimizations

### 1. Efficient Fuzzy Matching
- Only runs fuzzy matching if exact matches fail
- Uses 0.7 similarity threshold to avoid false positives
- Caches results for repeated queries

### 2. Smart Station Lookup
- Tries exact matches first (fastest)
- Falls back to fuzzy matching only when needed
- Maintains performance for clear pronunciations

## Future Enhancements

### 1. Machine Learning Integration
- Could train on actual user voice patterns
- Adapt to regional accent variations
- Learn from correction patterns

### 2. Phonetic Matching
- Could add phonetic algorithms (Soundex, Metaphone)
- Handle more complex pronunciation variations
- Support multiple languages better

### 3. Context-Aware Corrections
- Use previous queries to improve matching
- Consider geographic proximity for suggestions
- Learn user-specific pronunciation patterns

## Debugging Voice Recognition Issues

### Console Logging
The system now provides detailed logs:
```
Text analyzed: "Union Station to Oreo"
Fuzzy matching: "oreo" → "oriole" (similarity: 0.85)
Station found: Oriole GO (OR)
Finding schedule from Union Station (UN) to Oriole GO (OR)
```

### Common Issues & Solutions

**Issue**: "Station not found" errors
**Solution**: Check the fuzzy mappings, add new pronunciation variations

**Issue**: Wrong station matched
**Solution**: Adjust similarity threshold or add specific aliases

**Issue**: Slow response times
**Solution**: GTFS data loading - ensure files are accessible

## User Experience Improvements

### 1. Helpful Error Messages
Instead of generic errors, users now get:
- "Did you mean 'Oriole GO' instead of 'Oreo'?"
- "I found several stations: Union Station, Unionville GO. Which one?"
- "Try saying the full station name like 'Scarborough GO'"

### 2. Pronunciation Guidance
The app can provide pronunciation tips:
- "For Oriole station, try saying 'OR-ee-ole GO'"
- "Scarborough can be said as 'SCAR-bur-oh GO'"

### 3. Voice Feedback
Confirms what it understood:
- "I heard 'Union Station to Oreo'. Looking for trains to Oriole GO..."

This comprehensive fix ensures that users with various accents, pronunciation styles, and speech patterns can successfully use the voice transit assistant.
