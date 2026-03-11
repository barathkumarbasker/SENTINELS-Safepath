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
if (document.getElementById('plan-route-form')) {
    document.getElementById('plan-route-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hide initial state map view and show generic analysis result view
        document.getElementById('route-analysis-results').classList.remove('initially-hidden');
    });
}