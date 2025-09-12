// Voice Agent App
class VoiceAgent {
    constructor() {
        this.conversationHistory = [];
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        this.recognitionActive = false;
        this.finalTranscript = '';
        
        this.initElements();
        this.requestMicrophonePermission();
        this.initSpeechRecognition();
        this.attachEventListeners();
        this.updateStatus('Ready');
    }
    
    async requestMicrophonePermission() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
        } catch (error) {
            console.warn('Microphone permission denied or not available:', error);
            this.updateStatus('Microphone permission needed');
        }
    }
    
    initElements() {
        this.elements = {
            chatMessages: document.getElementById('chatMessages'),
            textInput: document.getElementById('textInput'),
            sendBtn: document.getElementById('sendBtn'),
            micBtn: document.getElementById('micBtn'),
            recordingIndicator: document.getElementById('recordingIndicator'),
            autoSpeak: document.getElementById('autoSpeak'),
            continuousMode: document.getElementById('continuousMode'),
            status: document.getElementById('status'),
            clearBtn: document.getElementById('clearBtn')
        };
    }
    
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;  // Changed back to false for stability
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;
            
            this.finalTranscript = '';
            this.recognitionActive = false;
            
            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.recognitionActive = true;
                this.updateStatus('Listening... Keep holding');
                this.elements.micBtn.classList.add('recording');
                this.elements.recordingIndicator.classList.remove('hidden');
                this.finalTranscript = '';
            };
            
            this.recognition.onresult = (event) => {
                let finalText = '';
                let interimText = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalText += transcript;
                    } else {
                        interimText += transcript;
                    }
                }
                
                if (finalText) {
                    this.finalTranscript += finalText + ' ';
                }
                
                // Show the combined transcript
                this.elements.textInput.value = (this.finalTranscript + interimText).trim();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.recognitionActive = false;
                
                // Handle different error types gracefully
                switch(event.error) {
                    case 'no-speech':
                        this.updateStatus('No speech detected');
                        break;
                    case 'aborted':
                        console.log('Recognition aborted (normal)');
                        return; // Don't show error for manual abort
                    case 'not-allowed':
                        this.updateStatus('Microphone access denied');
                        break;
                    case 'network':
                        this.updateStatus('Network error. Check connection.');
                        break;
                    default:
                        this.updateStatus('Speech recognition error');
                }
                
                this.cleanupRecording();
            };
            
            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.recognitionActive = false;
                
                // Auto-restart if we're still supposed to be recording
                if (this.isRecording && this.elements.continuousMode.checked) {
                    setTimeout(() => {
                        if (this.isRecording) {
                            this.startRecording();
                        }
                    }, 100);
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.elements.micBtn.disabled = true;
            this.elements.micBtn.querySelector('.mic-text').textContent = 'Not supported';
        }
    }
    
    attachEventListeners() {
        // Send button
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Prevent context menu on mic button
        this.elements.micBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Desktop mouse events
        this.elements.micBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startRecording();
        });
        
        this.elements.micBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.handleRecordingStop();
        });
        
        this.elements.micBtn.addEventListener('mouseleave', (e) => {
            if (this.isRecording) {
                this.handleRecordingStop();
            }
        });
        
        // Mobile touch events - improved handling
        let touchTimer;
        this.elements.micBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear any existing timer
            if (touchTimer) clearTimeout(touchTimer);
            
            // Start recording immediately
            this.startRecording();
            
            // Set a minimum hold time
            touchTimer = setTimeout(() => {
                this.touchHeld = true;
            }, 200);
            
            return false;
        });
        
        this.elements.micBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear timer
            if (touchTimer) clearTimeout(touchTimer);
            
            // Small delay to ensure speech is captured
            setTimeout(() => {
                this.handleRecordingStop();
            }, 300);
            
            return false;
        });
        
        // Prevent touchmove from interrupting
        this.elements.micBtn.addEventListener('touchmove', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Clear button
        this.elements.clearBtn.addEventListener('click', () => this.clearChat());
    }
    
    handleRecordingStop() {
        if (!this.isRecording) return;
        
        this.stopRecording();
        
        // Wait a bit to ensure final transcript is captured
        setTimeout(() => {
            const message = this.elements.textInput.value.trim();
            if (message && message.length > 1) {
                this.sendMessage();
            } else {
                this.updateStatus('No speech detected. Try again.');
                // Clear the input if there's just noise or very short text
                this.elements.textInput.value = '';
                setTimeout(() => {
                    this.updateStatus('Ready');
                }, 2000);
            }
        }, 800); // Increased timeout to ensure speech processing completes
    }
    
    startRecording() {
        if (!this.recognition) {
            this.updateStatus('Speech recognition not available');
            return;
        }

        if (this.isRecording || this.recognitionActive) {
            console.log('Already recording or recognition active');
            return;
        }
        
        this.isRecording = true;
        this.finalTranscript = '';
        this.elements.textInput.value = '';
        
        try {
            this.recognition.start();
            console.log('Started recording');
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.handleStartError(error);
        }
    }
    
    handleStartError(error) {
        if (error.name === 'InvalidStateError') {
            // Recognition might still be running, try to abort and restart
            console.log('Attempting to restart recognition');
            try {
                this.recognition.abort();
                setTimeout(() => {
                    if (this.isRecording) {
                        this.recognition.start();
                    }
                }, 200);
            } catch (abortError) {
                console.error('Failed to restart recognition:', abortError);
                this.cleanupRecording();
                this.updateStatus('Please try again');
            }
        } else {
            console.error('Start recording error:', error);
            this.cleanupRecording();
            this.updateStatus('Microphone error. Please try again.');
        }
    }
    
    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        
        if (this.recognition && this.recognitionActive) {
            try {
                this.recognition.stop();
                console.log('Stopped recording');
            } catch (error) {
                console.error('Error stopping recording:', error);
                this.recognition.abort();
            }
        }
        
        this.cleanupRecording();
        this.updateStatus('Processing...');
    }
    
    cleanupRecording() {
        this.elements.micBtn.classList.remove('recording');
        this.elements.recordingIndicator.classList.add('hidden');
        this.recognitionActive = false;
    }
    
    async sendMessage() {
        const message = this.elements.textInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.elements.textInput.value = '';
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Update status
        this.updateStatus('Thinking...');
        
        try {
            // Get AI response
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: this.conversationHistory.slice(-10) // Keep last 10 messages for context
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            
            const data = await response.json();
            
            // Add AI response to chat
            this.addMessage(data.response, 'ai');
            
            // Add to conversation history
            this.conversationHistory.push({ role: 'assistant', content: data.response });
            
            // Speak the response if auto-speak is enabled
            if (this.elements.autoSpeak.checked) {
                this.updateStatus('Speaking...');
                await this.speakText(data.response);
            }
            
            this.updateStatus('Ready');
            
        } catch (error) {
            console.error('Error:', error);
            this.updateStatus('Error: Failed to get response');
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }
    
    async speakText(text) {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            return new Promise((resolve, reject) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                audio.onerror = reject;
                audio.play().catch(reject);
            });
            
        } catch (error) {
            console.error('TTS Error:', error);
            // Fallback to browser TTS if available
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                speechSynthesis.speak(utterance);
            }
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = sender === 'user' ? 'You' : 'NAVADA';
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.appendChild(label);
        headerDiv.appendChild(timestamp);
        
        // Format text with paragraphs
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Split text into paragraphs (by double newlines or periods followed by spaces)
        const paragraphs = text.split(/\n\n|\. (?=[A-Z])/);
        
        paragraphs.forEach((paragraph, index) => {
            if (paragraph.trim()) {
                const p = document.createElement('p');
                // Add period back if it was split
                let formattedText = paragraph.trim();
                if (index < paragraphs.length - 1 && !formattedText.endsWith('.') && !formattedText.endsWith('?') && !formattedText.endsWith('!')) {
                    formattedText += '.';
                }
                p.textContent = formattedText;
                content.appendChild(p);
            }
        });
        
        messageDiv.appendChild(headerDiv);
        messageDiv.appendChild(content);
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    clearChat() {
        this.conversationHistory = [];
        this.elements.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-header">
                    <span class="label">NAVADA</span>
                    <span class="timestamp">--:--</span>
                </div>
                <div class="message-content">
                    <p>Welcome to NAVADA. Hold the microphone button to speak, or type a message below.</p>
                </div>
            </div>
        `;
        this.updateStatus('Chat cleared');
        setTimeout(() => this.updateStatus('Ready'), 2000);
    }
    
    updateStatus(status) {
        this.elements.status.textContent = status;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAgent = new VoiceAgent();
});