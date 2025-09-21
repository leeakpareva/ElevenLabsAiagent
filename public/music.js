// Global variables
let currentCompositionPlan = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRangeSliders();
    initializeForms();
    updateGenerationTime();
});

// Initialize range sliders
function initializeRangeSliders() {
    const rangeInputs = document.querySelectorAll('.music-range');

    rangeInputs.forEach(input => {
        const updateValue = () => {
            const valueSpan = document.getElementById(input.id + '-value');
            if (valueSpan) {
                const seconds = parseInt(input.value) / 1000;
                valueSpan.textContent = seconds + 's';
            }
        };

        input.addEventListener('input', updateValue);
        updateValue(); // Set initial value
    });
}

// Initialize form handlers
function initializeForms() {
    // Simple form
    document.getElementById('simple-form').addEventListener('submit', handleSimpleGenerate);

    // Composition plan form
    document.getElementById('composition-form').addEventListener('submit', handleCompositionPlan);

    // Detailed form
    document.getElementById('detailed-form').addEventListener('submit', handleDetailedGenerate);

    // From plan form
    document.getElementById('from-plan-form').addEventListener('submit', handleFromPlanGenerate);
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.music-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.music-tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Simple music generation
async function handleSimpleGenerate(event) {
    event.preventDefault();

    const prompt = document.getElementById('simple-prompt').value;
    const duration = parseInt(document.getElementById('simple-duration').value);

    try {
        showLoading('simple');
        hideError('simple');
        hideResult('simple');
        startProgressAnimation('simple');

        const response = await fetch('/api/music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, duration }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate music');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        document.getElementById('simple-audio').src = audioUrl;

        hideLoading('simple');
        showResult('simple');
        updateGenerationTime();

    } catch (error) {
        console.error('Simple generation error:', error);
        hideLoading('simple');
        showError('simple', error.message);
    }
}

// Composition plan creation
async function handleCompositionPlan(event) {
    event.preventDefault();

    const prompt = document.getElementById('composition-prompt').value;
    const duration = parseInt(document.getElementById('composition-duration').value);

    try {
        showLoading('composition');
        hideError('composition');
        hideResult('composition');

        const response = await fetch('/api/music/composition-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, duration }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create composition plan');
        }

        const data = await response.json();
        currentCompositionPlan = data.compositionPlan;

        displayCompositionPlan(data.compositionPlan);

        hideLoading('composition');
        showResult('composition');

    } catch (error) {
        console.error('Composition plan creation error:', error);
        hideLoading('composition');
        showError('composition', error.message);
    }
}

// Detailed music generation
async function handleDetailedGenerate(event) {
    event.preventDefault();

    const prompt = document.getElementById('detailed-prompt').value;
    const duration = parseInt(document.getElementById('detailed-duration').value);

    try {
        showLoading('detailed');
        hideError('detailed');
        hideResult('detailed');

        const response = await fetch('/api/music/detailed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, duration }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate detailed music');
        }

        const data = await response.json();

        // Convert base64 audio to blob
        const audioBytes = atob(data.audioBase64);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        document.getElementById('detailed-audio').src = audioUrl;

        // Display metadata
        if (data.songMetadata) {
            displayMetadata(data.songMetadata, data.filename);
        }

        // Display composition plan
        if (data.compositionPlan) {
            displayDetailedCompositionPlan(data.compositionPlan);
        }

        hideLoading('detailed');
        showResult('detailed');

    } catch (error) {
        console.error('Detailed generation error:', error);
        hideLoading('detailed');
        showError('detailed', error.message);
    }
}

// Generate from composition plan
async function handleFromPlanGenerate(event) {
    event.preventDefault();

    const planInput = document.getElementById('plan-input').value;

    try {
        const compositionPlan = JSON.parse(planInput);

        showLoading('from-plan');
        hideError('from-plan');
        hideResult('from-plan');

        const response = await fetch('/api/music/from-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ compositionPlan }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate music from plan');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        document.getElementById('from-plan-audio').src = audioUrl;

        hideLoading('from-plan');
        showResult('from-plan');

    } catch (error) {
        console.error('From plan generation error:', error);
        hideLoading('from-plan');
        showError('from-plan', error.message);
    }
}

// Display composition plan
function displayCompositionPlan(plan) {
    const container = document.getElementById('composition-plan-display');

    let html = '<div>';

    // Global styles
    if (plan.positiveGlobalStyles && plan.positiveGlobalStyles.length > 0) {
        html += '<div class="music-section-card">';
        html += '<div class="music-section-name">Positive Global Styles</div>';
        html += '<div class="music-styles">';
        plan.positiveGlobalStyles.forEach(style => {
            html += `<span class="music-style-tag">${style}</span>`;
        });
        html += '</div></div>';
    }

    if (plan.negativeGlobalStyles && plan.negativeGlobalStyles.length > 0) {
        html += '<div class="music-section-card">';
        html += '<div class="music-section-name">Negative Global Styles</div>';
        html += '<div class="music-styles">';
        plan.negativeGlobalStyles.forEach(style => {
            html += `<span class="music-style-tag" style="background: rgba(100, 100, 100, 0.2); color: #999;">${style}</span>`;
        });
        html += '</div></div>';
    }

    // Sections
    if (plan.sections && plan.sections.length > 0) {
        html += '<h4 style="color: var(--color-accent-primary); margin: 20px 0 15px 0;">Sections</h4>';
        plan.sections.forEach((section, index) => {
            html += '<div class="music-section-card">';
            html += `<div class="music-section-name">${section.sectionName || `Section ${index + 1}`}</div>`;
            html += `<div class="music-section-duration">${section.durationMs}ms</div>`;

            if (section.positiveLocalStyles && section.positiveLocalStyles.length > 0) {
                html += '<div style="margin-bottom: 10px;"><strong style="color: var(--color-accent-primary);">Positive:</strong>';
                html += '<div class="music-styles">';
                section.positiveLocalStyles.forEach(style => {
                    html += `<span class="music-style-tag">${style}</span>`;
                });
                html += '</div></div>';
            }

            if (section.negativeLocalStyles && section.negativeLocalStyles.length > 0) {
                html += '<div><strong style="color: var(--color-text-secondary);">Negative:</strong>';
                html += '<div class="music-styles">';
                section.negativeLocalStyles.forEach(style => {
                    html += `<span class="music-style-tag" style="background: rgba(100, 100, 100, 0.2); color: #999;">${style}</span>`;
                });
                html += '</div></div>';
            }

            html += '</div>';
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

// Display detailed composition plan
function displayDetailedCompositionPlan(plan) {
    const container = document.getElementById('detailed-plan-display');
    displayCompositionPlan(plan);
    container.innerHTML = document.getElementById('composition-plan-display').innerHTML;
}

// Display metadata
function displayMetadata(metadata, filename) {
    const container = document.getElementById('detailed-metadata-content');

    let html = '';

    if (filename) {
        html += `<div class="music-metadata-item">
            <span class="music-metadata-label">Filename:</span>
            <span class="music-metadata-value">${filename}</span>
        </div>`;
    }

    if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
            const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;

            html += `<div class="music-metadata-item">
                <span class="music-metadata-label">${displayKey}:</span>
                <span class="music-metadata-value">${displayValue}</span>
            </div>`;
        });
    }

    container.innerHTML = html;
}

// Use current composition plan
function usePlan() {
    if (currentCompositionPlan) {
        switchTab('from-plan');
        document.getElementById('plan-input').value = JSON.stringify(currentCompositionPlan, null, 2);
    }
}

// Copy composition plan to clipboard
async function copyPlan() {
    if (currentCompositionPlan) {
        try {
            await navigator.clipboard.writeText(JSON.stringify(currentCompositionPlan, null, 2));
            alert('Composition plan copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = JSON.stringify(currentCompositionPlan, null, 2);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Composition plan copied to clipboard!');
        }
    }
}

// Load sample composition plan
function loadSamplePlan() {
    const samplePlan = {
        "positiveGlobalStyles": [
            "electronic",
            "fast-paced",
            "driving synth arpeggios",
            "punchy drums",
            "distorted bass",
            "glitch effects",
            "aggressive rhythmic textures",
            "high adrenaline"
        ],
        "negativeGlobalStyles": ["acoustic", "slow", "minimalist", "ambient", "lo-fi"],
        "sections": [
            {
                "sectionName": "Intro",
                "positiveLocalStyles": [
                    "rising synth arpeggio",
                    "glitch fx",
                    "filtered noise sweep",
                    "soft punchy kick building tension"
                ],
                "negativeLocalStyles": ["soft pads", "melodic vocals", "ambient textures"],
                "durationMs": 3000,
                "lines": []
            },
            {
                "sectionName": "Peak Drop",
                "positiveLocalStyles": [
                    "full punchy drums",
                    "distorted bass stab",
                    "aggressive rhythmic hits",
                    "rapid arpeggio sequences"
                ],
                "negativeLocalStyles": ["smooth transitions", "clean bass", "slow buildup"],
                "durationMs": 4000,
                "lines": []
            },
            {
                "sectionName": "Final Burst",
                "positiveLocalStyles": [
                    "glitch stutter",
                    "energy burst vox chopped sample",
                    "quick transitions",
                    "snare rolls"
                ],
                "negativeLocalStyles": ["long reverb tails", "fadeout", "gentle melodies"],
                "durationMs": 3000,
                "lines": []
            }
        ]
    };

    document.getElementById('plan-input').value = JSON.stringify(samplePlan, null, 2);
}

// Event handlers for buttons
document.addEventListener('DOMContentLoaded', function() {
    const usePlanBtn = document.getElementById('use-plan-btn');
    const copyPlanBtn = document.getElementById('copy-plan-btn');

    if (usePlanBtn) usePlanBtn.addEventListener('click', usePlan);
    if (copyPlanBtn) copyPlanBtn.addEventListener('click', copyPlan);
});

// Utility functions
function showLoading(section) {
    document.getElementById(section + '-loading').classList.add('active');
}

function hideLoading(section) {
    document.getElementById(section + '-loading').classList.remove('active');
}

function showError(section, message) {
    const errorElement = document.getElementById(section + '-error');
    errorElement.textContent = message;
    errorElement.classList.add('active');
}

function hideError(section) {
    document.getElementById(section + '-error').classList.remove('active');
}

function showResult(section) {
    document.getElementById(section + '-result').classList.add('active');
}

function hideResult(section) {
    document.getElementById(section + '-result').classList.remove('active');
}

// Progress animation
function startProgressAnimation(section) {
    const progressBar = document.getElementById(section + '-progress');
    if (progressBar) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 95) {
                progress = 95;
                clearInterval(interval);
            }
            progressBar.style.width = progress + '%';
        }, 500);

        // Store interval to clear it when loading stops
        progressBar.dataset.interval = interval;
    }
}

// Update generation time
function updateGenerationTime() {
    const timeElement = document.getElementById('generation-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
    }
}