// Creative AI Music Studio - Live Audio Visualization and Analysis
let isRecording = false;
let audioContext = null;
let analyser = null;
let mediaRecorder = null;
let audioStream = null;
let animationId = null;
let currentAudioElement = null;
let generatedAudioData = null;

// Initialize the studio when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeStudio();
    initializeAudioGeneration();
    setupEventHandlers();
});

// Initialize studio components
function initializeStudio() {
    setupWaveformCanvas();
    setupVoiceAnalyzer();
    setupCompositionChart();
    initializeTheme();
}

// Setup waveform canvas
function setupWaveformCanvas() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw initial waveform
    drawInitialWaveform(ctx, canvas);
}

// Draw initial static waveform
function drawInitialWaveform(ctx, canvas) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(16, 163, 127, 0.1)');
    gradient.addColorStop(0.5, 'rgba(16, 163, 127, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 163, 127, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw static waveform
    ctx.strokeStyle = '#10a37f';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
        const y = height / 2 + Math.sin(x * 0.02) * 20 * Math.random();
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
}

// Setup live waveform visualization
function setupLiveWaveform(audioElement) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    animateLiveWaveform();
}

// Animate live waveform
function animateLiveWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!analyser) return;

        animationId = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(16, 163, 127, 0.1)');
        gradient.addColorStop(0.5, 'rgba(16, 163, 127, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 163, 127, 0.1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw waveform
        ctx.strokeStyle = '#10a37f';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                ctx.moveTo(x, height / 2 - y);
            } else {
                ctx.lineTo(x, height / 2 - y);
            }

            x += sliceWidth;
        }

        ctx.stroke();

        // Update voice analyzer with audio data
        updateVoiceAnalyzer(dataArray);

        // Update composition breakdown
        updateCompositionBreakdown(dataArray);
    }

    draw();
}

// Setup voice analyzer
function setupVoiceAnalyzer() {
    const rings = document.querySelectorAll('.voice-ring');

    // Initial animation for rings
    rings.forEach((ring, index) => {
        ring.style.animationDelay = `${index * 0.2}s`;
    });

    // Update initial values
    updateVoiceMetrics(440, 75, 120);
}

// Update voice analyzer with real audio data
function updateVoiceAnalyzer(audioData) {
    if (!audioData || audioData.length === 0) return;

    // Calculate audio properties
    const avgFrequency = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    const maxFrequency = Math.max(...audioData);
    const intensity = Math.round((maxFrequency / 255) * 100);

    // Calculate pitch (simplified)
    const pitch = Math.round(200 + (avgFrequency / 255) * 600);

    // Calculate rhythm (BPM estimation)
    const rhythm = Math.round(60 + (intensity / 100) * 180);

    // Update metrics display
    updateVoiceMetrics(pitch, intensity, rhythm);

    // Update visual rings based on intensity
    const rings = document.querySelectorAll('.voice-ring');
    rings.forEach((ring, index) => {
        const scale = 0.8 + (intensity / 100) * (0.4 + index * 0.2);
        ring.style.transform = `scale(${scale})`;
        ring.style.opacity = 0.3 + (intensity / 100) * 0.7;
    });
}

// Update voice metrics display
function updateVoiceMetrics(pitch, intensity, rhythm) {
    document.getElementById('pitchValue').textContent = `${pitch}Hz`;
    document.getElementById('intensityValue').textContent = `${intensity}%`;
    document.getElementById('rhythmValue').textContent = `${rhythm}BPM`;
}

// Setup composition chart
function setupCompositionChart() {
    const bars = document.querySelectorAll('.chart-bar .bar-fill');

    // Initial animation
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'height 0.5s ease';
            const randomHeight = 20 + Math.random() * 60;
            bar.style.height = `${randomHeight}%`;

            const percent = bar.querySelector('.bar-percent');
            if (percent) {
                percent.textContent = `${Math.round(randomHeight)}%`;
            }
        }, index * 200);
    });
}

// Update composition breakdown with real data
function updateCompositionBreakdown(audioData) {
    if (!audioData || audioData.length === 0) return;

    const bars = document.querySelectorAll('.chart-bar .bar-fill');
    const segments = 6; // Number of frequency segments
    const segmentSize = Math.floor(audioData.length / segments);

    bars.forEach((bar, index) => {
        if (index >= segments) return;

        const startIndex = index * segmentSize;
        const endIndex = startIndex + segmentSize;
        const segmentData = audioData.slice(startIndex, endIndex);
        const avgValue = segmentData.reduce((sum, val) => sum + val, 0) / segmentData.length;
        const percentage = Math.round((avgValue / 255) * 100);

        bar.style.height = `${Math.max(5, percentage)}%`;

        const percentElement = bar.querySelector('.bar-percent');
        if (percentElement) {
            percentElement.textContent = `${percentage}%`;
        }
    });
}

// Audio generation form handling
function initializeAudioGeneration() {
    const form = document.getElementById('studioForm');
    if (form) {
        form.addEventListener('submit', handleAudioGeneration);
    }

    // Setup duration slider
    const durationSlider = document.getElementById('duration');
    const durationValue = document.getElementById('durationValue');

    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', () => {
            const seconds = durationSlider.value / 1000;
            durationValue.textContent = `${seconds}s`;
        });
    }
}

// Handle audio generation
async function handleAudioGeneration(event) {
    event.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const duration = parseInt(document.getElementById('duration').value);

    try {
        showStudioLoading(true);

        // Simulate API call (replace with actual endpoint)
        const response = await fetch('/api/music/studio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, duration }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate music');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store generated audio data
        generatedAudioData = { url: audioUrl, blob: audioBlob, prompt: prompt };

        // Play in studio audio player
        const audioPlayer = document.getElementById('studioAudio');
        if (audioPlayer) {
            audioPlayer.src = audioUrl;
            currentAudioElement = audioPlayer;

            // Setup live visualization when audio plays
            audioPlayer.addEventListener('play', () => {
                setupLiveWaveform(audioPlayer);
                document.getElementById('waveformOverlay').style.display = 'none';
            });

            audioPlayer.addEventListener('pause', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                document.getElementById('waveformOverlay').style.display = 'flex';
            });
        }

        showStudioLoading(false);
        showStudioNotification('Music generated successfully!', 'success');

    } catch (error) {
        console.error('Generation error:', error);
        showStudioLoading(false);
        showStudioNotification('Failed to generate music. Please try again.', 'error');
    }
}

// Show/hide studio loading state
function showStudioLoading(show) {
    const loadingElement = document.getElementById('studioLoading');
    const generateBtn = document.querySelector('#studioForm button[type="submit"]');

    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }

    if (generateBtn) {
        generateBtn.disabled = show;
        generateBtn.textContent = show ? 'Generating...' : 'Generate Music';
    }
}

// Studio notification system
function showStudioNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `studio-notification studio-notification-${type}`;
    notification.textContent = message;

    // Add styles if needed
    if (!document.querySelector('#studio-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'studio-notification-styles';
        styles.textContent = `
            .studio-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            }

            .studio-notification-success {
                background: linear-gradient(135deg, #10a37f, #1a7f64);
            }

            .studio-notification-error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }

            .studio-notification-info {
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
            }

            .studio-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Download functionality for studio
function downloadStudioAudio() {
    if (!generatedAudioData) {
        showStudioNotification('No audio available for download. Generate music first.', 'error');
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `navada-studio-${timestamp}.mp3`;

    const downloadLink = document.createElement('a');
    downloadLink.href = generatedAudioData.url;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showStudioNotification('Track downloaded successfully!', 'success');
}

// Setup event handlers
function setupEventHandlers() {
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadStudioAudio);
    }

    // Navigation buttons
    const musicStudioBtn = document.querySelector('a[href="/music"]');
    const homeBtn = document.querySelector('a[href="/"]');

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Record button for live input
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
}

// Toggle recording for live audio input
async function toggleRecording() {
    if (!isRecording) {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const source = audioContext.createMediaStreamSource(audioStream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source.connect(analyser);

            isRecording = true;
            document.getElementById('recordBtn').textContent = 'Stop Recording';

            animateLiveWaveform();
            showStudioNotification('Recording started - speak or play music!', 'info');

        } catch (error) {
            console.error('Recording error:', error);
            showStudioNotification('Failed to access microphone', 'error');
        }
    } else {
        stopRecording();
    }
}

// Stop recording
function stopRecording() {
    isRecording = false;

    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    analyser = null;

    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.textContent = 'Start Live Analysis';
    }

    // Reset to static waveform
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    drawInitialWaveform(ctx, canvas);

    // Reset voice analyzer
    setupVoiceAnalyzer();

    showStudioNotification('Recording stopped', 'info');
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('navada-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('navada-theme', newTheme);

    document.documentElement.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

// Resize handler
window.addEventListener('resize', () => {
    setupWaveformCanvas();
});