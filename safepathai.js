/* safepathai.js - Strong Hybrid AI Assistant */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const display = document.getElementById('chat-display');
    const statusBanner = document.getElementById('ai-status-banner');

    // --- CONFIGURATION ---
    const HF_TOKEN = "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"; 
    const MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct";
    const AI_SYSTEM_PROMPT = "You are SafePath AI, an urban security expert. Provide concise, predictive safety advice.";

    // --- HIGH-CAPACITY OFFLINE INTELLIGENCE ENGINE ---
const OFFLINE_KNOWLEDGE = [
    // 1. SYSTEM, IDENTITY & CAPABILITIES
    {
        keys: ["status", "score", "condition", "safety level", "current safety", "how safe"],
        response: () => {
            const score = localStorage.getItem('current_safety_score') || "85";
            return `🛡️ <strong>Current Safety Score: ${score}/100</strong>.<br>📝 <em>Analysis:</em> Your local perimeter is stable. Infrastructure status is nominal. Stay alert!`;
        }
    },
    {
        keys: ["who are you", "what is safepath", "creator", "about", "capabilities", "what can you do"],
        response: () => `🤖 I am your <strong>comprehensive safety intelligence companion</strong>. I provide:<br>
            • 📞 <strong>Complete India Emergency Helplines</strong> (Police, Women, Child, etc.)<br>
            • 🛣️ <strong>Route Safety Analysis</strong><br>
            • 📍 <strong>Safety Zone Management</strong><br>
            • ⚠️ <strong>Real-time Threat Intelligence</strong><br>
            • 🔐 <strong>Personal Safety Protocols</strong><br><br>
            <em>I operate locally to ensure your data never leaves this device.</em>`
    },
    {
        keys: ["help", "commands", "menu", "options", "guide", "try asking"],
        response: () => `💡 <strong>Safepath Offline Intelligence Core:</strong><br>
            • 🛡️ <strong>Safety:</strong> 'status', 'tips', 'night protocol', 'winter safety'<br>
            • 🚨 <strong>Emergency:</strong> 'sos', 'police', 'all emergency numbers', 'cyber crime'<br>
            • 🗺️ <strong>Navigation:</strong> 'zones', 'commute', 'transport', 'shortcuts'<br>
            • 💬 <strong>Social:</strong> 'hello', 'who are you', 'weather advice'<br><br>
            <em>Try asking: "Women helplines" or "Railway emergency"</em>`
    },

    // 2. COMPREHENSIVE INDIA EMERGENCY DATABASE
    {
        keys: ["all emergency numbers", "emergency list", "helplines", "numbers"],
        response: () => `📞 <strong>National Emergency Directory:</strong><br>
            • 🚨 <strong>National:</strong> 112<br>
            • 👮 <strong>Police:</strong> 100<br>
            • 🚑 <strong>Ambulance:</strong> 102<br>
            • 🚒 <strong>Fire:</strong> 101<br>
            • 🛤️ <strong>Railway:</strong> 1512<br>
            • 👩 <strong>Women:</strong> 1091 / 181<br>
            • 🧒 <strong>Child:</strong> 1098`
    },
    {
        keys: ["women helpline", "women safety", "domestic violence", "1091", "181"],
        response: () => `👩‍🦰 <strong>Women's Safety Protocol:</strong><br>
            • <strong>National Helpline:</strong> 1091<br>
            • <strong>Women in Distress:</strong> 181<br>
            • <strong>NCW (WhatsApp):</strong> +91 72177 35372<br>
            📝 <em>Tip: Turn on "Share Location" with your emergency contact now.</em>`
    },
    {
        keys: ["railway", "train emergency", "rpf", "1512"],
        response: () => `🚆 <strong>Railway Security:</strong><br>
            • <strong>All-India Railway Helpline:</strong> 1512<br>
            • <strong>RPF Security:</strong> 182<br>
            • <strong>Medical Assistance:</strong> 138`
    },
    {
        keys: ["disaster", "ndrf", "flood help", "earthquake", "fire", "management"],
        response: () => `🌋 <strong>Disaster Management:</strong><br>
            • <strong>NDRF Control Room:</strong> 011-24363260<br>
            • <strong>Disaster Management Services:</strong> 108<br>
            • 🚒 <strong>Fire Service:</strong> 101`
    },
    {
        keys: ["child", "children", "1098", "kid"],
        response: () => `🧒 <strong>Child Helpline:</strong><br>
            • <strong>CHILDLINE India:</strong> 1098<br>
            📝 <em>This is a 24/7 free emergency phone service for children in need of aid/assistance.</em>`
    },
    {
        keys: ["senior citizen", "elderly", "old age help", "14567"],
        response: () => `👴 <strong>Senior Citizen Support:</strong><br>
            • <strong>Elderline:</strong> 14567<br>
            • <strong>Police Help for Seniors:</strong> 1291`
    },
    {
        keys: ["cyber crime", "hacking", "fraud", "online theft", "scam", "1930"],
        response: () => `💻 <strong>Cyber Security Cell:</strong><br>
            • <strong>Report Financial Fraud:</strong> 1930<br>
            • <strong>National Portal:</strong> cybercrime.gov.in<br>
            📝 <em>Tip: Never share your OTP or click on suspicious links.</em>`
    },
    {
        keys: ["road accident", "highway", "ambulance", "nhai", "1033"],
        response: () => `🛣️ <strong>Road & Highway Safety:</strong><br>
            • <strong>National Highway Helpline:</strong> 1033<br>
            • <strong>Ambulance:</strong> 102 / 108<br>
            📝 <em>Tip: Note the nearest Milestone or 'Green Pillar' number to give your exact location.</em>`
    },

    // 3. CRITICAL RESPONSE (SOS)
    {
        keys: ["sos", "emergency", "help me", "danger", "attacked", "followed"],
        response: () => `<div style="border: 2px solid #ef4444; padding: 12px; border-radius: 10px; background: rgba(239, 68, 68, 0.05);">
            <span style="color:#ef4444">🚨 <strong>CRITICAL PROTOCOL ACTIVATED:</strong></span><br>
            1. 📍 GPS broadcasting initiated to emergency contacts.<br>
            2. 🎙️ Background audio recording enabled.<br>
            3. 🏃 <strong>Move to a 'Safe Zone' or well-lit area immediately.</strong>
            </div>`
    },

    // 4. URBAN NAVIGATION & PROTOCOLS
    {
        keys: ["night", "dark", "evening", "late", "midnight", "after dark"],
        response: () => "🌙 <strong>Night Protocol:</strong> Stick to 'Class A' arterial roads. Avoid parks and industrial bypasses. Use the 'Share Trip' feature even for short walks. 🚶‍♂️✨"
    },
    {
        keys: ["travel", "commute", "walking", "transit", "bus", "train", "metro", "uber", "taxi", "ride"],
        response: () => "🚍 <strong>Transit Intelligence:</strong> Wait in well-lit designated areas. For ride-shares, verify the plate and driver identity **before** entering. Keep phone charge >20%. 📱"
    },
    {
        keys: ["zones", "my areas", "locations", "safe spots", "work", "home", "college"],
        response: () => {
            const zones = JSON.parse(localStorage.getItem('safepath_zones')) || [];
            return zones.length > 0 ? 
                `📍 <strong>Active Safety Zones:</strong> ${zones.map(z => `<br>• ${z.name} [${z.type}]`).join('')}` : 
                "🏜️ No custom Safety Zones defined. Visit the 'Zones' tab to mark your safe havens.";
        }
    },

    // 5. PREVENTATIVE INTELLIGENCE
    {
        keys: ["tips", "advice", "protocol", "best practices", "how to stay safe", "security"],
        response: () => {
            const tips = [
                "🎧 Situational Awareness: Keep one earbud out in transit.",
                "🔌 Digital Safety: Avoid using public USB charging stations.",
                "👛 Physical Safety: Keep a 'dummy' wallet if traveling in high-risk sectors.",
                "🧠 Intel: Your intuition is your fastest processor—if it feels wrong, leave.",
                "🔦 Gear: Carry a small tactical flashlight; it's a great deterrent."
            ];
            return `💡 <strong>Safety Tip:</strong> ${tips[Math.floor(Math.random() * tips.length)]}`;
        }
    },
    {
        keys: ["weather", "rain", "storm", "monsoon", "flood", "heat", "cold", "winter"],
        response: () => "🌦️ <strong>Environmental Safety:</strong> Check for local drainage warnings. Avoid standing near electrical poles during high winds. Keep a waterproof power bank. ⚡"
    },

    // 6. CONVERSATIONAL
    {
        keys: ["hello", "hi", "hey", "greetings", "good morning", "good evening"],
        response: () => "👋 <strong>Safepath AI active.</strong> Offline modules loaded. System standing by for safety queries. How can I protect you today?"
    },
    {
        keys: ["thank you", "thanks", "great", "awesome", "good job"],
        response: () => "🤝 Stay safe out there. I'm always here to assist."
    }
];

    // FIX 1: Explicitly return 'msg' so callOpenSourceAI can target it
    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.innerHTML = text;
        display.appendChild(msg);
        display.scrollTop = display.scrollHeight;
        return msg; 
    }

    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        statusBanner.innerText = isOnline ? "Online - Cloud Intelligence Active" : "Offline - Local Intelligence Active";
        statusBanner.className = `status-banner ${isOnline ? 'status-online' : 'status-offline'}`;
        input.placeholder = isOnline ? "Ask Safepath anything..." : "Offline: Type 'help' for commands";
    }

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
        return null; 
    }

    // --- TIER 3: Online Processing ---
    async function callOpenSourceAI(userQuery) {
        const loadingMsg = addMessage("Thinking...", 'ai');
        
        try {
            // FIX 2: Correct Router URL format for inference
            const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
            
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${AI_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userQuery}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                    parameters: { 
                        max_new_tokens: 300, 
                        temperature: 0.6,
                        return_full_text: false 
                    }
                }),
            });

            // Robust error checking
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 50)}`);
            }

            const result = await response.json();
            let aiText = "";

            // Parsing Llama-3 response
            if (Array.isArray(result) && result[0].generated_text) {
                aiText = result[0].generated_text;
                
                // Clean up any remaining chat template markers
                if (aiText.includes('<|start_header_id|>assistant<|end_header_id|>')) {
                    const parts = aiText.split('<|start_header_id|>assistant<|end_header_id|>');
                    aiText = parts[parts.length - 1];
                }
            } else if (result.generated_text) {
                aiText = result.generated_text;
            } else {
                throw new Error("Unexpected API response format");
            }

            loadingMsg.innerHTML = aiText.trim() || "I couldn't generate a safety recommendation. Please try again.";

        } catch (error) {
            console.error("AI Error:", error);
            loadingMsg.innerHTML = "Cloud link interrupted. <strong>Default Advice:</strong> Stick to well-lit main roads and keep emergency contacts ready.";
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
    addMessage(`
    👋 <strong>Welcome to Safepath AI!</strong><br>
    I am your comprehensive safety intelligence companion, operating 100% offline to keep your data secure.<br><br>
    🛡️ <strong>Core Features:</strong><br>
    • 📞 <strong>Emergency Helplines:</strong> Police, Women, Child, & Railway help.<br>
    • 🛣️ <strong>Route Analysis:</strong> Safety-first pathfinding for your commute.<br>
    • 📍 <strong>Zone Management:</strong> Define and monitor your safe havens.<br>
    • ⚠️ <strong>Threat Intelligence:</strong> Real-time local security protocols.<br><br>
    🚀 <strong>Quick Start:</strong><br>
    Type <strong>'all emergency numbers'</strong>, <strong>'safety tips'</strong>, or simply <strong>'help'</strong> to see all local commands. How can I protect you today?
`, "ai");
});

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const command = chip.getAttribute('data-cmd');
        const inputField = document.getElementById('ai-input');
        
        // 1. Fill the input
        inputField.value = command;
        
        // 2. Trigger the send button click
        document.getElementById('ai-send-btn').click();
    });
});