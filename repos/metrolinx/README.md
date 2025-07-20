# Voice-Based Metrolinx Query App

A mobile-first Progressive Web App (PWA) that allows users to interact with Metrolinx transit information using voice commands. Users can press and hold a button, speak their query in multiple languages, and receive spoken responses about train schedules, service status, routes, and fares.

## Features

### 🎤 Voice Input
- **Press & Hold Interface**: Single-button design for intuitive voice input
- **Multilingual Support**: Supports English, French, and Mandarin Chinese
- **Natural Language Processing**: Handles accents and imperfect grammar
- **Real-time Transcription**: Shows what you're saying as you speak

### 🗣️ Voice Output
- **Text-to-Speech**: Responses are spoken in the original input language
- **Replay Functionality**: Replay the last response with a single tap
- **Language Detection**: Automatically detects and responds in the appropriate language

### 🚊 Transit Information
- **Schedule Queries**: Get train departure and arrival times
- **Service Status**: Check for delays and service disruptions
- **Route Planning**: Get step-by-step travel directions
- **Fare Information**: Check ticket prices for different passenger types

### 📱 Mobile-First Design
- **Progressive Web App**: Installable on mobile devices
- **Responsive Design**: Optimized for phones and tablets
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Offline Capable**: Core functionality works without internet

## Supported Query Examples

### English
- "What's the train schedule from Union Station to Oriole Station today?"
- "Are there any delays on the GO Train?"
- "How much does it cost to travel from Bloor to Kennedy?"
- "How do I get from Pearson Airport to Union Station?"

### French
- "Donnez-moi l'horaire du train de la gare Union à la gare Oriole"
- "Y a-t-il des retards sur le train GO?"
- "Combien coûte le voyage de Bloor à Kennedy?"

### Mandarin
- "请给我union火车站到Oriole火车站今天的列车时刻表"
- "GO火车有延误吗？"

## Getting Started

### Prerequisites
- Modern web browser with Web Speech API support (Chrome, Firefox, Safari)
- Microphone access permissions
- HTTPS connection (required for speech recognition)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd metrolinx
   ```

2. **Serve the files over HTTPS**
   ⚠️ **IMPORTANT**: The Web Speech API requires HTTPS to work properly and maintain microphone permissions. Using `file://` URLs will cause repeated permission prompts.

   **Option A: Python HTTPS Server (Recommended)**
   ```bash
   python3 server.py
   ```
   Then open: `https://localhost:8443`
   
   **Option B: Node.js HTTPS Server**
   ```bash
   node server.js
   ```
   Then open: `https://localhost:8443`
   
   **Option C: Node.js HTTP Server (Limited functionality)**
   ```bash
   node server.js --http
   ```
   Then open: `http://localhost:8080`
   
   **Option D: Live Server (VS Code Extension)**
   - Install the Live Server extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"
   - Note: May have permission issues without HTTPS

3. **Accept the security certificate**
   - You'll see a security warning about the self-signed certificate
   - Click "Advanced" then "Proceed to localhost (unsafe)"
   - This is safe for local development

4. **Grant microphone permissions**
   - When prompted, click "Allow" for microphone access
   - The permission will persist for the HTTPS session

### Mobile Installation (PWA)

1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" prompt or menu option
3. Follow the installation prompts
4. The app will be available as a native-like app on your device

## Usage

1. **Grant Permissions**: Allow microphone access when prompted
2. **Press and Hold**: Press and hold the large circular button
3. **Speak Your Query**: Ask about schedules, delays, routes, or fares
4. **Listen to Response**: The app will speak the answer in your language
5. **Replay if Needed**: Use the replay button to hear the response again

## Technical Architecture

### Core Components

- **`index.html`**: Main application structure and UI
- **`styles.css`**: Mobile-first responsive styling with Metrolinx branding
- **`app.js`**: Main application controller and UI management
- **`speech-handler.js`**: Voice recognition and text-to-speech functionality
- **`metrolinx-api.js`**: Mock API for transit information queries
- **`manifest.json`**: PWA configuration for mobile installation

### Key Technologies

- **Web Speech API**: For voice recognition and text-to-speech
- **Progressive Web App**: For mobile installation and offline capability
- **CSS Grid/Flexbox**: For responsive layout
- **ES6+ JavaScript**: Modern JavaScript features
- **Service Worker Ready**: Prepared for offline functionality

### Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Speech Recognition | ✅ | ✅ | ✅ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| PWA Installation | ✅ | ✅ | ✅ | ✅ |
| Microphone Access | ✅ | ✅ | ✅ | ✅ |

## API Integration

The app currently uses a mock API (`metrolinx-api.js`) for demonstration purposes. To integrate with real Metrolinx APIs:

1. Replace the mock API calls in `metrolinx-api.js`
2. Add authentication headers if required
3. Update the response parsing logic
4. Handle real-time data updates

### Mock API Endpoints

- **Schedule Queries**: Returns upcoming departure/arrival times
- **Service Status**: Provides current service disruption information
- **Route Planning**: Generates step-by-step travel directions
- **Fare Information**: Returns pricing for different passenger categories

## Customization

### Adding New Languages

1. Update the `languageMap` in `speech-handler.js`
2. Add language detection keywords
3. Update the footer in `index.html`
4. Test voice recognition and synthesis

### Styling Modifications

- Colors: Update CSS custom properties in `styles.css`
- Fonts: Modify the font-family declarations
- Layout: Adjust the flexbox and grid configurations
- Animations: Customize the pulse and transition effects

### Adding New Query Types

1. Add intent detection in `metrolinx-api.js`
2. Create response formatting functions
3. Update the natural language processing
4. Add corresponding UI elements if needed

## Development

### File Structure
```
metrolinx/
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── app.js                  # Main application logic
├── speech-handler.js       # Voice functionality
├── metrolinx-api.js       # API integration
├── manifest.json          # PWA manifest
├── create-icon.html       # Icon generator utility
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

### Testing

1. **Voice Recognition**: Test with different accents and languages
2. **Mobile Responsiveness**: Test on various screen sizes
3. **PWA Installation**: Verify installation on different devices
4. **Error Handling**: Test with microphone denied, network issues
5. **Cross-browser**: Test on Chrome, Firefox, Safari, Edge

### Debugging

- Open browser developer tools
- Check console for error messages
- Monitor network requests to the mock API
- Test microphone permissions in browser settings

## Security Considerations

- **HTTPS Required**: Web Speech API requires secure context
- **Microphone Permissions**: Handle permission denials gracefully
- **Data Privacy**: Voice data is processed locally when possible
- **API Security**: Implement proper authentication for production APIs

## Performance Optimization

- **Lazy Loading**: Load components as needed
- **Caching**: Implement service worker for offline functionality
- **Compression**: Minify CSS and JavaScript for production
- **CDN**: Use CDN for faster asset delivery

## Accessibility

- **Screen Readers**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Voice Control**: Primary interface is voice-based

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on multiple devices and browsers
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the browser console for error messages
- Ensure microphone permissions are granted
- Verify HTTPS connection for speech recognition
- Test with different browsers if issues persist

## Roadmap

- [ ] Real Metrolinx API integration
- [ ] Offline functionality with Service Worker
- [ ] Additional language support
- [ ] Voice shortcuts and commands
- [ ] Integration with calendar apps
- [ ] Push notifications for service alerts
- [ ] Advanced route optimization
- [ ] Accessibility improvements
