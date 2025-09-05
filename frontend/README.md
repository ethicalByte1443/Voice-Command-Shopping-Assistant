# Voice Shopping Assistant - Frontend

A modern, responsive web application for voice-controlled shopping list management with AI-powered recommendations.

## 🚀 Quick Start

1. **Start the Backend Server**
   ```bash
   # Make sure your FastAPI backend is running on http://127.0.0.1:8000
   cd .. # Go to backend directory
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Serve the Frontend**
   ```bash
   # Option 1: Using the provided startup script (recommended)
   python start.py
   
   # Option 2: Using Python's built-in server
   python -m http.server 3000
   
   # Option 3: On Windows, double-click start.bat
   
   # Option 4: Using Node.js live-server (if installed)
   npx live-server --port=3000
   ```

3. **Open in Browser**
   - Main App: http://localhost:3000
   - Test Page: http://localhost:3000/test.html

## 🧪 Testing

### API Test Page
Visit `test.html` to verify:
- ✅ Backend connection
- ✅ Wishlist API endpoints
- ✅ Recommendations API
- ✅ Microphone access
- ✅ Audio recording functionality

### Manual Testing Checklist
- [ ] Voice recording starts/stops correctly
- [ ] Audio is processed and transcribed
- [ ] AI responses are displayed properly
- [ ] Confirmation dialog works
- [ ] Wishlist updates in real-time
- [ ] Recommendations load and display
- [ ] Mobile responsive design
- [ ] Error handling and notifications

## 🎯 Features

### ✅ Implemented
- **Voice Recording**: Web Audio API with MediaRecorder
- **Real-time Transcription**: AssemblyAI integration
- **AI Command Processing**: Groq LLM integration
- **Smart Wishlist Management**: Add/remove items with confirmation
- **AI Recommendations**: Personalized suggestions based on history
- **Responsive Design**: Mobile-first, works on all devices
- **Error Handling**: Comprehensive error states and recovery
- **Loading States**: Visual feedback for all operations
- **Offline Detection**: Handles network connectivity issues

### 🎤 Voice Commands
Try these voice commands:
- "Add milk to my list"
- "I need 3 apples"
- "Remove bread from my shopping list"
- "Add 2 bottles of water"
- "I want to buy bananas"

## 🏗️ Architecture

```
frontend/
├── index.html          # Main application
├── test.html          # API testing page
├── css/
│   ├── main.css       # Core styles and layout
│   ├── components.css # UI component styles
│   └── responsive.css # Mobile/tablet styles
├── js/
│   ├── app.js         # Main application logic
│   ├── api.js         # Backend API communication
│   ├── audio.js       # Audio recording management
│   └── ui.js          # UI state and DOM manipulation
└── README.md          # This file
```

## 🔧 Configuration

### Backend URL
The frontend is configured to connect to `http://127.0.0.1:8000` by default. To change this:

1. Edit `js/app.js` line 4:
   ```javascript
   this.baseURL = 'http://your-backend-url:port';
   ```

2. Or set it dynamically:
   ```javascript
   window.voiceShoppingApp.baseURL = 'http://new-url:port';
   ```

### Username
Default username is `default_user`. To change:
```javascript
window.voiceShoppingApp.username = 'your_username';
```

## 🌐 Browser Compatibility

### Fully Supported
- ✅ Chrome 60+ (Desktop & Mobile)
- ✅ Firefox 55+ (Desktop & Mobile)
- ✅ Edge 79+ (Desktop & Mobile)
- ✅ Safari 14+ (Desktop & Mobile)

### Limitations
- **Safari < 14**: Limited MediaRecorder support
- **iOS Safari**: Requires user gesture for audio recording
- **Older browsers**: No Web Audio API support

## 📱 Mobile Optimization

- **Touch-friendly**: Large buttons and touch targets
- **Responsive**: Adapts to all screen sizes
- **PWA-ready**: Can be installed as a web app
- **Offline-aware**: Handles network connectivity
- **Performance**: Optimized for mobile networks

## 🚨 Troubleshooting

### Common Issues

1. **"Microphone not working"**
   - Check browser permissions
   - Ensure HTTPS (required for microphone access)
   - Try refreshing the page

2. **"Backend connection failed"**
   - Verify backend is running on port 8000
   - Check CORS settings in backend
   - Use the test page to diagnose

3. **"Voice commands not recognized"**
   - Speak clearly and wait for the recording indicator
   - Check your internet connection
   - Verify AssemblyAI API key in backend

4. **"Recommendations not loading"**
   - Add some items to your wishlist first
   - Check backend database connection
   - Verify MongoDB is running

### Debug Mode
Open browser console (F12) to see detailed logs and error messages.

## 🎨 Customization

### Styling
- Edit CSS files in the `css/` directory
- Main colors defined in `css/main.css` CSS variables
- Component styles in `css/components.css`
- Responsive breakpoints in `css/responsive.css`

### Functionality
- Modify `js/app.js` for core application logic
- Update `js/ui.js` for interface changes
- Extend `js/api.js` for additional backend endpoints

## 📄 License

This project is part of a technical assessment and is for demonstration purposes.