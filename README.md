# NAVADA - AI Voice Assistant

A sophisticated AI voice assistant powered by ElevenLabs voice synthesis and OpenAI's GPT-3.5. NAVADA features a sleek black and red theme with advanced speech recognition capabilities.

## Features

- 🎤 **Voice Input**: Hold-to-talk functionality with real-time speech recognition
- 🗣️ **Natural Speech**: High-quality voice synthesis using ElevenLabs "George" voice
- 🧠 **AI Conversations**: Intelligent responses powered by OpenAI GPT-3.5
- 🎨 **Modern UI**: Black and red theme with futuristic Orbitron font
- 📱 **Mobile Optimized**: Responsive design for iPhone and mobile devices
- ⏰ **Timestamps**: Each message includes time stamps
- 📝 **Structured Responses**: AI responses formatted with proper paragraphs
- 🌟 **Animated Landing Page**: Eye-catching NAVADA logo with motion effects

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Services**: 
  - OpenAI GPT-3.5 for conversation
  - ElevenLabs for voice synthesis
  - Web Speech API for voice recognition
- **Styling**: Custom CSS with Orbitron font

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/leeakpareva/ElevenLabsAiagent.git
   cd ElevenLabsAiagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Landing page: http://localhost:3000
   - Direct app: http://localhost:3000/app

## Usage

1. **Landing Page**: Click on the animated "NAVADA" text to enter the app
2. **Voice Input**: Hold the microphone button and speak
3. **Text Input**: Type messages in the input field
4. **Settings**: Toggle auto-speak and continuous conversation mode
5. **Clear Chat**: Reset the conversation history

## API Integration

### ElevenLabs
- Voice ID: `JBFqnCBsd6RMkjVDRZzb` (George voice)
- Model: `eleven_multilingual_v2`
- Output format: `mp3_44100_128`

### OpenAI
- Model: `gpt-3.5-turbo`
- Temperature: 0.7
- Max tokens: 150

## Mobile Support

- Optimized for iPhone with proper viewport settings
- Touch-friendly hold-to-talk functionality
- Responsive design for various screen sizes
- Safe area support for iPhone X and newer

## Design Credits

**Designed + Coded By Lee Akpareva MBA, MA**

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

*NAVADA - Your intelligent voice assistant with style.*