document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById('insert_map');
    element.style = 'height:300px;';
    const my_map = L.map(element).setView([41.1558, -80.0815], 10);
    const myAPIKey = "09d5b6e52d8946efab4b009650b3b211";
    var isRetina = L.Browser.retina;
    const retinaUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";
    const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
        apiKey: myAPIKey,
        maxZoom: 20,
        id: 'osm-bright',
    }).addTo(my_map);
    let resultsLayer = L.layerGroup();
    const healthBtn = document.getElementById("health-btn");
    const socialBtn = document.getElementById("social-btn");
    const clearBtn = document.getElementById("clear-btn");
    if (healthBtn) {
        healthBtn.addEventListener("click", (event) => {
            console.log("Healthcare button clicked");
            healthBtn.style.backgroundColor = "#4CAF50";
            socialBtn.style.backgroundColor = "#111111";
            clearBtn.style.backgroundColor = "#111111";
            loadPlaces("https://api.geoapify.com/v2/places?categories=healthcare.clinic_or_praxis&filter=rect:-78.09921757581298,38.73660286449031,-82.07762874146101,43.58987145915573&limit=100&apiKey=09d5b6e52d8946efab4b009650b3b211");
        });
    }
    if (socialBtn) {
        socialBtn.addEventListener("click", (event) => {
            console.log("Social Services button clicked");
            healthBtn.style.backgroundColor = "#111111";
            socialBtn.style.backgroundColor = "#4CAF50";
            clearBtn.style.backgroundColor = "#111111";
            loadPlaces("https://api.geoapify.com/v2/places?categories=service.social_facility&filter=rect:-78.09921757581298,38.73660286449031,-82.07762874146101,43.58987145915573&limit=100&apiKey=09d5b6e52d8946efab4b009650b3b211");
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener("click", (event) => {
            console.log("Clear Map button clicked");
            healthBtn.style.backgroundColor = "#111111";
            socialBtn.style.backgroundColor = "#111111";
            clearBtn.style.backgroundColor = "#4CAF50";
            resultsLayer.clearLayers();
        });
    }
    async function loadPlaces(searchUrl) {
        const bounds = my_map.getBounds();
        const rect = "${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}";
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error("Goapify API error: ${response.statusText}");
        }
        const data = await response.json();
        console.log("Places loaded: ", data);
        renderPlaces(data);
    }
    function markericonUrl(iconName = "map-marker", color = "#37a961") {
        const icon = encodeURIComponent(iconName);
        const tint = encodeURIComponent(color);
        return "https://api.geoapify.com/v2/icon?type=material&color=%23ff5722&size=64&apiKey=09d5b6e52d8946efab4b009650b3b211";
    }
    function renderPlaces(geojson) {
        if (!geojson || !Array.isArray(geojson.features))
            return;
        if (!L.resultsLayer) {
            resultsLayer.clearLayers();
            resultsLayer = L.layerGroup().addTo(my_map);
        }
        else {
            resultsLayer.clearLayers();
        }
        geojson.features.forEach((f) => {
            const { geometry, properties } = f;
            if (!geometry || geometry.type !== "Point")
                return;
            const [lng, lat] = geometry.coordinates;
            const my_icon = L.icon({
                iconUrl: markericonUrl(),
                iconSize: [38, 55],
                iconAnchor: [18, 50],
                popupAnchor: [0, 50]
            });
            const name = properties?.name || properties?.address_line1 || "Unnamed place";
            const address = properties?.address_line2 || properties?.formal || "";
            L.marker([lat, lng], { icon: my_icon })
                .bindPopup("<strong>${escapeHtml(name)}</strong><br>${escapeHtml(address)}")
                .addTo(resultsLayer);
        });
    }
    function escapeHtml(s = "") {
        return String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});
