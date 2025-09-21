import express from 'express';
import cors from 'cors';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import fs from 'fs';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve landing page as default
app.get('/', (req, res) => {
    const landingPath = path.join(__dirname, 'public', 'landing.html');
    console.log('Serving landing page from:', landingPath);
    res.sendFile(landingPath);
});

// Serve the ElevenLabs page
app.get('/elevenlabs', (req, res) => {
    const elevenLabsPath = path.join(__dirname, 'public', 'elevenlabs.html');
    console.log('Serving ElevenLabs page from:', elevenLabsPath);
    res.sendFile(elevenLabsPath);
});

// Serve the Music Studio page
app.get('/music', (req, res) => {
    const musicPath = path.join(__dirname, 'public', 'music.html');
    console.log('Serving Music Studio page from:', musicPath);
    res.sendFile(musicPath);
});


// Serve static files (after route handlers)
app.use(express.static('public'));

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George voice
const SYSTEM_PROMPT = `You are LESLIE, a sophisticated AI voice assistant with web search capabilities and a friendly yet professional personality.

You have access to real-time web search through Brave Search API. When users ask questions that require current information, web search, or recent events, you should search the web to provide accurate, up-to-date responses.

Structure your responses clearly with:
1. Direct answer first
2. Brief explanation or context
3. Follow-up question if appropriate

Keep responses conversational but well-structured. Use natural paragraph breaks for longer responses.
Avoid markdown, code blocks, or special formatting since you're speaking through voice synthesis.
Aim for 2-4 sentences per response, using proper paragraph structure when needed.

When you need to search the web, determine appropriate search terms and use the search functionality to get current information.`;

// Brave Search API function
async function searchWeb(query) {
    try {
        const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': process.env.BRAVE_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Brave Search API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Brave Search API Error:', error);
        return null;
    }
}

// Determine if a query needs web search
function needsWebSearch(message) {
    const webSearchIndicators = [
        'current', 'latest', 'recent', 'today', 'news', 'weather', 'stock price',
        'what is happening', 'what happened', 'breaking news', 'update',
        'now', 'this week', 'this month', 'this year', '2024', '2025',
        'search for', 'look up', 'find information about', 'tell me about'
    ];

    const lowerMessage = message.toLowerCase();
    return webSearchIndicators.some(indicator => lowerMessage.includes(indicator));
}

// AI response generator using OpenAI
async function generateAIResponse(userMessage, conversationHistory) {
    try {
        console.log('Calling OpenAI API with message:', userMessage);

        let searchResults = null;
        let enhancedMessage = userMessage;

        // Check if we need to perform a web search
        if (needsWebSearch(userMessage)) {
            console.log('Performing web search for:', userMessage);
            searchResults = await searchWeb(userMessage);

            if (searchResults && searchResults.web && searchResults.web.results) {
                const topResults = searchResults.web.results.slice(0, 3);
                const searchInfo = topResults.map(result =>
                    `Title: ${result.title}\nSnippet: ${result.description}\nURL: ${result.url}`
                ).join('\n\n');

                enhancedMessage = `${userMessage}\n\nWeb Search Results:\n${searchInfo}\n\nPlease provide a response based on this current information.`;
                console.log('Enhanced message with search results');
            }
        }

        // Build messages array for OpenAI
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // Add current user message (potentially enhanced with search results)
        messages.push({ role: 'user', content: enhancedMessage });
        
        console.log('OpenAI messages array length:', messages.length);
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 150,
        });
        
        console.log('OpenAI API call successful');
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error Details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            status: error.status
        });
        
        // Fallback to simple responses if OpenAI fails
        console.log('Using fallback response due to OpenAI error');
        const fallbackResponses = {
            'hello': 'Hello! How can I help you today?',
            'how are you': "I'm doing great, thank you for asking! How are you doing?",
            'what can you do': 'I can have conversations with you, answer questions, help with various tasks, and speak using natural voice synthesis.',
            'goodbye': 'Goodbye! It was nice talking with you. Have a great day!',
        };
        
        const lowerMessage = userMessage.toLowerCase();
        for (const [key, response] of Object.entries(fallbackResponses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return "I'm having trouble connecting right now, but I'm still here to help! What would you like to talk about?";
    }
}

// Convert text to speech
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        console.log('Generating speech for:', text);
        
        const audioStream = await elevenlabs.textToSpeech.convert(
            VOICE_ID,
            {
                text: text,
                model_id: 'eleven_multilingual_v2',
                output_format: 'mp3_44100_128',
            }
        );
        
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        
        const audioBuffer = Buffer.concat(chunks);
        
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        
        res.send(audioBuffer);
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Create composition plan
app.post('/api/music/composition-plan', async (req, res) => {
    try {
        const { prompt, duration = 10000 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Music prompt is required' });
        }

        console.log('Creating composition plan with prompt:', prompt);

        const compositionPlan = await elevenlabs.music.compositionPlan.create({
            prompt: prompt,
            music_length_ms: duration,
        });

        res.json({
            compositionPlan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Composition Plan Creation Error:', error);
        res.status(500).json({ error: 'Failed to create composition plan' });
    }
});

// Generate music with detailed composition data
app.post('/api/music/detailed', async (req, res) => {
    try {
        const { prompt, duration = 10000 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Music prompt is required' });
        }

        console.log('Generating detailed music composition with prompt:', prompt);

        const trackDetails = await elevenlabs.music.composeDetailed({
            prompt: prompt,
            music_length_ms: duration,
        });

        // Convert the audio to buffer for sending
        const chunks = [];
        for await (const chunk of trackDetails.audio) {
            // Ensure chunk is a Buffer
            const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            chunks.push(bufferChunk);
        }

        const audioBuffer = Buffer.concat(chunks);

        // Return both audio and metadata
        res.json({
            compositionPlan: trackDetails.json?.composition_plan,
            songMetadata: trackDetails.json?.song_metadata,
            filename: trackDetails.filename,
            audioBase64: audioBuffer.toString('base64'),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Detailed Music Generation Error:', error);

        // Handle quota exceeded error specifically
        if (error.statusCode === 401 && error.body?.detail?.status === 'quota_exceeded') {
            return res.status(401).json({
                error: 'ElevenLabs quota exceeded. Please check your account credits.',
                details: error.body.detail.message
            });
        }

        res.status(500).json({ error: 'Failed to generate detailed music composition' });
    }
});

// Generate music from existing composition plan
app.post('/api/music/from-plan', async (req, res) => {
    try {
        const { compositionPlan } = req.body;

        if (!compositionPlan) {
            return res.status(400).json({ error: 'Composition plan is required' });
        }

        console.log('Generating music from composition plan');

        const track = await elevenlabs.music.compose({
            composition_plan: compositionPlan,
        });

        // Convert the track to buffer for sending
        const chunks = [];
        for await (const chunk of track) {
            // Ensure chunk is a Buffer
            const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            chunks.push(bufferChunk);
        }

        const audioBuffer = Buffer.concat(chunks);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error('Music Generation from Plan Error:', error);
        res.status(500).json({ error: 'Failed to generate music from composition plan' });
    }
});

// Generate music using ElevenLabs Music API (original endpoint)
app.post('/api/music', async (req, res) => {
    try {
        const { prompt, duration = 10000 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Music prompt is required' });
        }

        console.log('Generating music with prompt:', prompt);

        const track = await elevenlabs.music.compose({
            prompt: prompt,
            music_length_ms: duration,
        });

        // Convert the track to buffer for sending
        const chunks = [];
        for await (const chunk of track) {
            // Ensure chunk is a Buffer
            const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            chunks.push(bufferChunk);
        }

        const audioBuffer = Buffer.concat(chunks);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error('Music Generation Error:', error);

        // Handle quota exceeded error specifically
        if (error.statusCode === 401 && error.body?.detail?.status === 'quota_exceeded') {
            return res.status(401).json({
                error: 'ElevenLabs quota exceeded. Please check your account credits.',
                details: error.body.detail.message
            });
        }

        res.status(500).json({ error: 'Failed to generate music' });
    }
});

// Process user message and generate response
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        console.log('Received chat request:', { message, historyLength: history.length });
        
        if (!message) {
            console.log('No message provided');
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('User message:', message);
        
        // Generate AI response
        const aiResponse = await generateAIResponse(message, history);
        console.log('AI response:', aiResponse);
        
        res.json({ 
            response: aiResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat Error Details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message 
        });
    }
});

// Web search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        console.log('Performing web search for:', query);

        const searchResults = await searchWeb(query);

        if (!searchResults) {
            return res.status(500).json({ error: 'Search failed' });
        }

        res.json({
            query: query,
            results: searchResults,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Search endpoint error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

const PORT = process.env.PORT || 0; // Use 0 to let system assign available port
const server = app.listen(PORT, () => {
    const actualPort = server.address().port;
    console.log(`Voice AI Agent server running at http://localhost:${actualPort}`);
    console.log('Open your browser and navigate to the URL above to start using the voice agent!');
});