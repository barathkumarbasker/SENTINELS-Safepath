document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map (Centered near your primary area)
    const map = L.map('route-map').setView([13.0827, 80.2707], 12); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let startMarker, endMarker;
    const startInput = document.getElementById('start-point');
    const destInput = document.getElementById('destination');

    // 2. Reverse Geocoding Function (Turns Lat/Long into Address)
    async function updateAddress(lat, lng, inputField) {
        inputField.value = "Loading address...";
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            inputField.value = data.display_name.split(',').slice(0, 3).join(','); // Shortened address
        } catch (error) {
            inputField.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    // 3. Map Click Logic
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (!startMarker) {
            // Set Start Point
            startMarker = L.marker([lat, lng], { draggable: true }).addTo(map)
                .bindPopup("Starting Point").openPopup();
            updateAddress(lat, lng, startInput);
        } else if (!endMarker) {
            // Set Destination
            endMarker = L.marker([lat, lng], { draggable: true }).addTo(map)
                .bindPopup("Destination").openPopup();
            updateAddress(lat, lng, destInput);
        } else {
            // Reset if both exist
            map.removeLayer(startMarker);
            map.removeLayer(endMarker);
            startMarker = null;
            endMarker = null;
            startInput.value = "";
            destInput.value = "";
        }
    });

    // 4. Form Submission (Simulated Analysis)
    const form = document.getElementById('plan-route-form');
    const results = document.getElementById('route-analysis-results');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (startInput.value && destInput.value) {
            results.classList.remove('initially-hidden');
            results.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Please select both points on the map or type them in.");
        }
    });
});

// 1. Initialize the Heatmap Layer
let heatLayer = null;

function renderSafetyHeatmap(map) {
    // Get threats from localStorage (reported in threats.html)
    const storedThreats = JSON.parse(localStorage.getItem('safepath_threats')) || [];
    
    // Map threats to the format required by Leaflet.heat: [lat, lng, intensity]
    const heatData = storedThreats.map(threat => {
        // High priority/danger threats get higher intensity (0.8 vs 0.4)
        const intensity = threat.type === 'Emergency' ? 0.9 : 0.5;
        return [threat.lat, threat.lng, intensity];
    });

    // Add some "Static/Historical" danger points for Chennai if no user data exists
    if (heatData.length === 0) {
        heatData.push(
            [13.0400, 80.2200, 0.6], // Sample Zone A
            [13.0116, 80.2078, 0.4]  // Sample Zone B
        );
    }

    // Remove existing layer if it exists (for refreshing)
    if (heatLayer) map.removeLayer(heatLayer);

    // Create and add the heatmap layer
    heatLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
            0.4: 'blue', 
            0.6: 'lime', 
            0.8: 'yellow', 
            1.0: 'red'
        }
    }).addTo(map);
}

// 2. Call this inside your map initialization
// Example: renderSafetyHeatmap(myMap);