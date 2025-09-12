import express from 'express';
import cors from 'cors';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import fs from 'fs';

dotenv.config();

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

// Serve the main app
app.get('/app', (req, res) => {
    const appPath = path.join(__dirname, 'public', 'index.html');
    console.log('Serving app from:', appPath);
    res.sendFile(appPath);
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
const SYSTEM_PROMPT = `You are NAVADA, a sophisticated AI assistant with a friendly yet professional personality. 

Structure your responses clearly with:
1. Direct answer first
2. Brief explanation or context
3. Follow-up question if appropriate

Keep responses conversational but well-structured. Use natural paragraph breaks for longer responses. 
Avoid markdown, code blocks, or special formatting since you're speaking through voice synthesis.
Aim for 2-4 sentences per response, using proper paragraph structure when needed.`;

// AI response generator using OpenAI
async function generateAIResponse(userMessage, conversationHistory) {
    try {
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
        
        // Add current user message
        messages.push({ role: 'user', content: userMessage });
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 150,
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Fallback to simple responses if OpenAI fails
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

// Process user message and generate response
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        if (!message) {
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
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Voice AI Agent server running at http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above to start using the voice agent!');
});