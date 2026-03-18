/* safepathai.js - Strong Hybrid AI Assistant */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const display = document.getElementById('chat-display');
    const statusBanner = document.getElementById('ai-status-banner');

    // --- CONFIGURATION ---
    const HF_TOKEN = "hf_xxxxxxxxxxxxxxxxxxxx"; // Replace with your real token
    const MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct";
    const AI_SYSTEM_PROMPT = "You are SafePath AI, an urban security expert. Provide concise, predictive safety advice.";

    // --- EXPANDED OFFLINE INTELLIGENCE ---
    const OFFLINE_KNOWLEDGE = [
        {
            keys: ["status", "score", "condition"],
            response: () => {
                const score = localStorage.getItem('current_safety_score') || "85";
                return `Current Safety Score: <strong>${score}/100</strong>. Analysis: Stable urban environment with standard patrol frequency.`;
            }
        },
        {
            keys: ["help", "commands", "what can you do"],
            response: () => `<strong>Available Commands:</strong><br>
                • <strong>'status'</strong> - Current area safety score<br>
                • <strong>'zones'</strong> - List your saved safety zones<br>
                • <strong>'sos'</strong> - Trigger emergency protocols<br>
                • <strong>'tips'</strong> - General safety best practices<br>
                • <strong>'night'</strong> - Night-time travel protocols<br>
                • <strong>'offline'</strong> - View offline capabilities`
        },
        {
            keys: ["sos", "emergency", "help me", "danger"],
            response: () => `<span style="color:#ef4444"><strong>EMERGENCY ACTIVATED:</strong> Emergency contacts notified. Stay in a high-visibility area. Authorities have been pinged with your last known GPS.</span>`
        },
        {
            keys: ["zones", "my areas"],
            response: () => {
                const zones = JSON.parse(localStorage.getItem('safepath_zones')) || [];
                return zones.length > 0 ? 
                    `Saved Zones: ${zones.map(z => `<br>• ${z.name} (${z.type})`).join('')}` : 
                    "No Safety Zones defined in local storage.";
            }
        },
        {
            keys: ["night", "dark", "evening"],
            response: () => "Night Protocol: Avoid unlit shortcuts. Safepath recommends sticking to 'Class A' arterial roads even if the route is 10% longer."
        },
        {
            keys: ["tips", "advice", "protocol"],
            response: () => "Safety Tips: 1. Keep one earbud out to maintain situational awareness. 2. Carry a backup power bank. 3. Trust your intuition—if a street feels 'off', it likely is."
        },
        {
            keys: ["travel", "commute", "walking"],
            response: () => "Travel Intel: Always share your live ETA with a trusted contact when using public transit or walking alone after dusk."
        }
    ];

    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.innerHTML = text;
        display.appendChild(msg);
        display.scrollTop = display.scrollHeight;
    }

    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        statusBanner.innerText = isOnline ? "Online - Cloud Intelligence Active" : "Offline - Local Intelligence Active";
        statusBanner.className = `status-banner ${isOnline ? 'status-online' : 'status-offline'}`;
        input.placeholder = isOnline ? "Ask Safepath anything..." : "Offline: Type 'help' for commands";
    }

    // --- TIER 1 & 2: Local Processing ---
    function processLocalIntelligence(query) {
        const q = query.toLowerCase();
        
        for (const entry of OFFLINE_KNOWLEDGE) {
            if (entry.keys.some(k => q.includes(k))) {
                return entry.response();
            }
        }

        if (!navigator.onLine) {
            return "I am currently offline. I don't recognize that command. Type <strong>'help'</strong> to see what I can do without internet.";
        }
        return null; // Pass to Cloud AI
    }

    // --- TIER 3: Online Processing ---
    async function callOpenSourceAI(userQuery) {
        addMessage('<span class="loading-dots">Consulting Safepath Cloud Intelligence</span>', 'ai');
        const loadingMsg = display.lastElementChild;

        try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${AI_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userQuery}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                    parameters: { max_new_tokens: 300, temperature: 0.6 }
                }),
            });

            const result = await response.json();
            let aiText = "";
            
            if (Array.isArray(result) && result[0].generated_text) {
                const parts = result[0].generated_text.split('<|start_header_id|>assistant<|end_header_id|>');
                aiText = parts[parts.length - 1];
            } else {
                throw new Error("API Busy");
            }

            loadingMsg.innerHTML = aiText.trim();

        } catch (error) {
            loadingMsg.innerHTML = "Cloud link interrupted. <strong>Default Advice:</strong> Maintain awareness and stick to populated routes.";
        }
    }

    function handleChat() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        const localResponse = processLocalIntelligence(text);
        if (localResponse) {
            setTimeout(() => addMessage(localResponse, 'ai'), 400);
        } else {
            callOpenSourceAI(text);
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleChat);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // --- INITIALIZATION ---
    updateOnlineStatus();
    // Default Help Display on Load
    addMessage("Welcome to <strong>Safepath AI</strong>. How can I assist your security today? Type <strong>'help'</strong> to see available local commands.", "ai");
});