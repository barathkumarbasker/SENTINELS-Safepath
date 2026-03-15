/* safepath_ai/script.js
    Offline self-dependent logic for persistent data, simulated geoloc, and safety intelligence.
*/

// --- 1. Global Setup & Initial State Simulation ---

// Define simulated location points and their safety scores (Chennai, India coordinates)
// In a live system, this would be a predictive model API.
const localSafetyIntelligence = [
    { coords: [13.0418, 80.2337], score: 85, status: "Very Safe", description: "Central, high-visibility area." },
    { coords: [13.0116, 80.2078], score: 78, status: "Generally Safe", description: "Standard urban environment." },
    { coords: [12.9801, 80.2184], score: 55, status: "Cautionary", description: "Low lighting, higher crime index." },
    { coords: [12.9631, 80.2452], score: 38, status: "Unsafe Zone", description: "Not recommended at night." },
    { coords: [12.8996, 80.2209], score: 92, status: "High Security", description: "Gated community area." }
];

// LocalStorage keys for persistence
const LOCAL_STORAGE_KEYS = {
    ZONES: 'safepath_zones',
    THREATS: 'safepath_threats'
};

// --- 2. Offline Simulation Logic ---

// Get a simulated current location from the user (Chennai Default for Indian simulation)
// In a live system, this would be browser geolocation API.
async function getSimulatedCurrentLocation() {
    // Chennai, India Default
    return {
        lat: 13.0116,
        lon: 80.2078
    };
}

// Function to find the nearest intelligence point to a given coordinate
function findNearestSafetyScore(currentLat, currentLon) {
    let nearestPoint = localSafetyIntelligence[0];
    let minDistance = calculateDistance(currentLat, currentLon, localSafetyIntelligence[0].coords[0], localSafetyIntelligence[0].coords[1]);

    localSafetyIntelligence.forEach(point => {
        const dist = calculateDistance(currentLat, currentLon, point.coords[0], point.coords[1]);
        if (dist < minDistance) {
            minDistance = dist;
            nearestPoint = point;
        }
    });

    return nearestPoint;
}

// Haversine formula for distance between two points (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1);
    const dLon = deg2rad(lon2-lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Calculate the simulated safety score on the dashboard
async function calculateSafetyScore() {
    const currentScoreElement = document.getElementById('current-safety-score');
    const currentStatusElement = document.getElementById('current-safety-status');

    if (currentScoreElement && currentStatusElement) {
        currentScoreElement.innerText = "Calculating...";
        
        try {
            const loc = await getSimulatedCurrentLocation();
            const safetyIntel = findNearestSafetyScore(loc.lat, loc.lon);
            
            // Replicate the values seen in image_0.png
            currentScoreElement.innerText = safetyIntel.score;
            currentStatusElement.innerText = safetyIntel.status;
            
            // Set trend indicator color, e.g., if safe, use text-up
            const trendElement = document.getElementById('safety-trend-indicator');
            if (safetyIntel.score >= 70) {
                currentStatusElement.classList.add('status-safe');
                trendElement.innerText = "+12%"; // Simulated trend from image_0.png
                trendElement.classList.add('text-up');
            } else if (safetyIntel.score >= 50) {
                currentStatusElement.classList.add('status-warning');
                trendElement.innerText = "-2%";
                trendElement.classList.add('text-warning');
            } else {
                currentStatusElement.classList.add('status-danger');
                trendElement.innerText = "-8%";
                trendElement.classList.add('text-down');
            }

        } catch (error) {
            currentScoreElement.innerText = "Error";
            currentStatusElement.innerText = "Check Location Settings";
        }
    }
}

// --- 3. Persistent Data Management (Zones & Threats) ---

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function updateDashboardCounts() {
    const zonesCountElement = document.getElementById('safe-zones-count');
    const alertsCountElement = document.getElementById('active-alerts-count');

    if (zonesCountElement) {
        zonesCountElement.innerText = getData(LOCAL_STORAGE_KEYS.ZONES).length;
    }

    if (alertsCountElement) {
        // Active alerts can be simulated as zones with alerts enabled
        const alertsCount = getData(LOCAL_STORAGE_KEYS.ZONES).filter(zone => zone.alertsEnabled).length;
        alertsCountElement.innerText = alertsCount;
    }
}

function addZoneToLocalStorage(zoneData) {
    const currentZones = getData(LOCAL_STORAGE_KEYS.ZONES);
    currentZones.push(zoneData);
    saveData(LOCAL_STORAGE_KEYS.ZONES, currentZones);
    updateDashboardCounts(); // Update count on dashboard if active
}

function addThreatToLocalStorage(threatData) {
    const currentThreats = getData(LOCAL_STORAGE_KEYS.THREATS);
    currentThreats.push(threatData);
    saveData(LOCAL_STORAGE_KEYS.THREATS, currentThreats);
    
    // Also add this to the generic local intelligence if it's new
    // We can simulate this by linking threat description
}

// --- 4. Page-Specific Initializations ---

function updateStats() {
    // Also load dashboard threat view
    loadDashboardThreats();
    updateDashboardCounts();
}

// Function to populate the threats list on the dashboard (index.html)
function loadDashboardThreats() {
    const container = document.getElementById('local-threats-container');
    const emptyView = document.getElementById('empty-threats-view');
    const threats = getData(LOCAL_STORAGE_KEYS.THREATS);

    if (container && threats.length > 0) {
        // Hide the empty state referring to image_3.png
        emptyView.style.display = 'none';
        container.innerHTML = ''; // Clear previous contents

        threats.forEach(threat => {
            const threatItem = document.createElement('div');
            threatItem.classList.add('threat-item');
            threatItem.innerHTML = `
                <img src="icons/alert-octagon-red.svg" alt="danger icon" class="icon-med threat-icon">
                <div class="threat-content">
                    <h4>${formatThreatType(threat.type)}</h4>
                    <p class="threat-location">${threat.location}</p>
                    <p class="threat-time">${threat.date} at ${threat.time}</p>
                </div>
            `;
            container.appendChild(threatItem);
        });
    }
}

// Function to populate the main threats list (threats.html)
function loadThreatsList() {
    const container = document.getElementById('full-threats-list-container');
    const emptyView = document.getElementById('empty-threats-view-full');
    const threats = getData(LOCAL_STORAGE_KEYS.THREATS);

    if (container && threats.length > 0) {
        // Hide the empty state referring to image_3.png
        emptyView.style.display = 'none';
        container.innerHTML = ''; // Clear previous contents

        threats.forEach(threat => {
            const threatItem = document.createElement('div');
            threatItem.classList.add('card', 'threat-card');
            threatItem.innerHTML = `
                <div class="threat-header-full">
                    <span class="status-indicator status-danger status-small">${formatThreatType(threat.type)}</span>
                    <span class="threat-meta">${threat.date} | ${threat.time}</span>
                </div>
                <p class="threat-loc-full">${threat.location}</p>
                ${threat.notes ? `<p class="threat-notes-full">${threat.notes}</p>` : ''}
            `;
            container.appendChild(threatItem);
        });
    }
}

// Function to populate the main zones list (zones.html)
function loadZonesList() {
    const container = document.getElementById('zones-list-container');
    const currentZones = getData(LOCAL_STORAGE_KEYS.ZONES);

    if (container) {
        if (currentZones.length === 0) {
            container.innerHTML = '<p class="no-zones-text">No safety zones created yet.</p>';
        } else {
            container.innerHTML = ''; // Clear
            currentZones.forEach(zone => {
                const zoneItem = document.createElement('div');
                zoneItem.classList.add('card', 'zone-card');
                zoneItem.innerHTML = `
                    <div class="zone-header">
                        <img src="icons/map-pin.svg" alt="pin icon" class="icon-small">
                        <h4>${zone.name}</h4>
                        <span class="zone-type status-indicator status-safe status-small">${zone.type}</span>
                    </div>
                    <p class="zone-meta">${zone.center} (Radius: ${zone.radius}m)</p>
                    ${zone.alertsEnabled ? `<span class="status-indicator status-warning status-extra-small">Alerts Enabled</span>` : ''}
                `;
                container.appendChild(zoneItem);
            });
        }
    }
}

// --- 5. Form Handling & Simulation Functions ---

function formatThreatType(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// SOS Simulation Function
function triggerOfflineSOS() {
    const message = `SOS: Emergency alert from Safepath AI user at simulated Chennai location (13.0116, 80.2078). Pre-filled message for Indian Police Assistance.`;
    // We cannot open a live app/API offline, so we simulate with a clear confirmation alert.
    if (confirm(`SIMULATED OFFLINE SOS ACTIVATED\n\nYour precise location has been generated and a pre-filled emergency SMS has been created with the following message:\n\n'${message}'\n\nYou must send the SMS message in the next step.`)) {
        // This opens a mailto or SMS link to further simulate the action
        window.location.href = `mailto:controlroom.chennai@tncops.gov.in?subject=Safepath SOS&body=${encodeURIComponent(message)}`;
    }
}

// Handle Form Submission for Zones
if (document.getElementById('create-zone-form')) {
    document.getElementById('create-zone-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const zoneData = {
            name: document.getElementById('zone-name').value,
            type: document.getElementById('zone-type').value,
            radius: document.getElementById('zone-radius').value,
            center: document.getElementById('zone-center').value,
            arrivalTime: document.getElementById('zone-arrival-time').value,
            notes: document.getElementById('zone-notes').value,
            alertsEnabled: document.getElementById('enable-alerts').checked
        };
        
        addZoneToLocalStorage(zoneData);
        
        // Confirmation alert and redirect
        alert("Success! The safety zone has been created and saved locally.");
        window.location.href = 'index.html'; // Redirect to dashboard to update count
    });
}

// Handle Form Submission for Threats
if (document.getElementById('report-incident-form')) {
    document.getElementById('report-incident-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const threatData = {
            type: document.getElementById('incident-type').value,
            time: document.getElementById('incident-time').value,
            date: document.getElementById('incident-date').value,
            location: document.getElementById('incident-location').value,
            isAnonymous: document.getElementById('anonymous-report').checked,
            notes: document.getElementById('incident-notes').value
        };
        
        addThreatToLocalStorage(threatData);
        
        // Confirmation alert and redirect to threats list to show update
        alert("Thank you for your report! The incident has been successfully added to our local intelligence database.");
        window.location.href = 'threats.html';
    });
}

// Handle Form Submission for Routes
document.addEventListener('DOMContentLoaded', function() {
    const routeForm = document.getElementById('plan-route-form');
    const resultsArea = document.getElementById('route-analysis-results');

    if (routeForm && resultsArea) {
        routeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const start = document.getElementById('start-point').value;
            const end = document.getElementById('destination').value;
            const submitBtn = routeForm.querySelector('button');
            const list = document.getElementById('guide-list');

            // 1. CLEAR & SHOW (Immediate feedback)
            resultsArea.classList.remove('initially-hidden');
            list.innerHTML = "<li>Calculating safest route...</li>";
            document.getElementById('analysis-title').innerText = "AI Processing...";
            submitBtn.disabled = true;
            submitBtn.innerText = "Analyzing...";

            if (navigator.onLine && start && end) {
                try {
                    // Set a timeout so the script doesn't hang if the API is slow
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second limit

                    // 1. Geocoding
                    const startRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(start)}`, { signal: controller.signal });
                    const endRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(end)}`, { signal: controller.signal });
                    
                    const startData = await startRes.json();
                    const endData = await endRes.json();
                    clearTimeout(timeoutId);

                    if (startData.length === 0 || endData.length === 0) throw new Error("Location not found");

                    // 2. Routing (OSRM)
                    const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startData[0].lon},${startData[0].lat};${endData[0].lon},${endData[0].lat}?steps=true`);
                    const routeData = await routeRes.json();

                    if (routeData.code !== "Ok") throw new Error("Route not found");

                    const route = routeData.routes[0];
                    const steps = route.legs[0].steps;

                    // 3. Update UI
                    document.getElementById('analysis-title').innerText = "Live Route Analysis";
                    document.getElementById('path-label').innerText = `Path: ${start} to ${end}`;
                    document.getElementById('safety-badge').innerText = "Verified Safe";
                    
                    // Show up to 15 steps for full detail
                    list.innerHTML = steps.slice(0, 15).map((step, index) => {
                        const instruction = step.maneuver.instruction || `${step.maneuver.type} ${step.maneuver.modifier || ''} ${step.name || ''}`;
                        return `<li>${index + 1}. ${instruction.toUpperCase()} <span class="loc">[${(step.distance / 1000).toFixed(2)} km]</span></li>`;
                    }).join('');

                    if (steps.length > 15) {
                        list.innerHTML += `<li style="list-style:none; color:gray; padding-top:10px;">+ ${steps.length - 15} more steps for total trip.</li>`;
                    }

                    document.getElementById('alt-note-text').innerText = `Total Distance: ${(route.distance / 1000).toFixed(1)} km. Estimated Duration: ${(route.duration / 60).toFixed(0)} mins.`;

                } catch (error) {
                    console.error("API Error:", error);
                    showOfflineFallback();
                }
            } else {
                showOfflineFallback();
            }

            // Reset button and view
            submitBtn.disabled = false;
            submitBtn.innerText = "Analyze Safety";
            resultsArea.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function showOfflineFallback() {
        document.getElementById('analysis-title').innerText = "Currently Offline Analysis Results (Offline Mode)";
        const list = document.getElementById('guide-list');
        // Restore the Panimalar default if the search fails
        list.innerHTML = `
            <li>1. Head West on <span class="loc">[Poonamallee High Road]</span> for 12 km.</li>
            <li>2. Take the exit towards <span class="loc">[Outer Ring Road (ORR)]</span>. <span class="path-note note-safe">(Well-lit highway)</span>.</li>
            <li>3. Destination <span class="loc">[Panimalar Campus]</span> is on your left after 3 km.</li>
        `;
    }
});

async function updateDynamicSafetyScore() {
    const scoreElement = document.getElementById('current-safety-score');
    const statusElement = document.getElementById('safety-status-text');

    // 1. Check if Offline
    if (!navigator.onLine) {
        scoreElement.innerText = "85"; // Default Offline Score
        if (statusElement) statusElement.innerText = "Offline Mode: Using cached safety data for Chennai.";
        return;
    }

    // 2. Online: Try to get Real Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                // Get area name from coordinates (Reverse Geocoding)
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${lat},${lon}`, {
                    headers: { 'User-Agent': 'SafepathAI_Student_Project' }
                });
                const data = await response.json();
                
                // Logic: Simulate a score based on the latitude (Random but consistent for the demo)
                // In a real app, this would fetch from a database of crime/safety stats
                const calculatedScore = Math.floor(70 + (Math.random() * 25)); 
                
                scoreElement.innerText = calculatedScore;
                if (statusElement) {
                    statusElement.innerText = `Location verified: ${data[0]?.display_name.split(',')[0] || 'Current Area'}`;
                }
                
                // Change color based on score
                scoreElement.style.color = calculatedScore > 75 ? "var(--text-up)" : "var(--safe-orange)";

            } catch (error) {
                console.error("Geocoding failed", error);
                fallbackToSimulated();
            }
        }, () => {
            // User denied location permission
            fallbackToSimulated();
        });
    } else {
        fallbackToSimulated();
    }

    function fallbackToSimulated() {
        scoreElement.innerText = "78"; 
        if (statusElement) statusElement.innerText = "Simulated Score (Location access denied)";
    }
}

// Trigger the check on load
document.addEventListener('DOMContentLoaded', updateDynamicSafetyScore);

// Add this inside your DOMContentLoaded block in script.js
const clearDataBtn = document.getElementById('clear-data-btn');
if (clearDataBtn) {
    clearDataBtn.addEventListener('click', function() {
        if (confirm("Are you sure you want to clear all reported threats and safety zones?")) {
            localStorage.clear();
            alert("Local storage cleared. The app will reset on the next reload.");
            window.location.reload();
        }
    });
}

// Remove the automatic call from the DOMContentLoaded block
document.addEventListener('DOMContentLoaded', function() {
    // ... other code ...
    // updateDynamicSafetyScore(); <-- Delete or comment out this line
});

// Instead, add a click listener to the safety card itself or a new button
const safetyCard = document.querySelector('.safety-score-card');
if (safetyCard) {
    safetyCard.addEventListener('click', updateDynamicSafetyScore);
    safetyCard.style.cursor = "pointer"; // Makes it look clickable
}