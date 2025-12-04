document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById('insert_map');
    element.style = 'height:300px;';
    let lat = 41.1558;
    let lon = -80.0815;
    const coords = getLocation();
    coords.then(function (nums) {
        lat = nums.at(0);
        lon = nums.at(1);
    });
    console.log(lat);
    console.log(lon);
    const my_map = L.map(element).setView([lat, lon], 10);
    const myAPIKey = "09d5b6e52d8946efab4b009650b3b211";
    var isRetina = L.Browser.retina;
    const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${myAPIKey}`;
    const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${myAPIKey}`;
    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
        maxZoom: 20,
        id: 'osm-bright',
    }).addTo(my_map);
    let resultsLayer = L.layerGroup();
    let chosenFeature;
    const healthBtn = document.getElementById("health-btn");
    const socialBtn = document.getElementById("social-btn");
    const childcareBtn = document.getElementById("childcare-btn");
    const storeBtn = document.getElementById("store-btn");
    const churchBtn = document.getElementById("church-btn");
    const savedBtn = document.getElementById("saved-btn");
    const clearBtn = document.getElementById("clear-btn");
    const saveLocBtn = document.getElementById("save-location-btn");
    let cats = "";
    if (healthBtn) {
        healthBtn.addEventListener("click", (event) => {
            console.log("Healthcare button clicked");
            resetButtonColors(healthBtn);
            loadPlaces("healthcare.clinic_or_praxis");
        });
    }
    if (socialBtn) {
        socialBtn.addEventListener("click", (event) => {
            console.log("Social Services button clicked");
            resetButtonColors(socialBtn);
            loadPlaces("service.social_facility");
        });
    }
    if (childcareBtn) {
        childcareBtn.addEventListener("click", (event) => {
            console.log("Childcare button clicked");
            resetButtonColors(childcareBtn);
            loadPlaces("childcare");
        });
    }
    if (storeBtn) {
        storeBtn.addEventListener("click", (event) => {
            console.log("Baby Store button clicked");
            resetButtonColors(storeBtn);
            loadPlaces("commercial.baby_goods");
        });
    }
    if (churchBtn) {
        churchBtn.addEventListener("click", (event) => {
            console.log("Christian Church button clicked");
            resetButtonColors(churchBtn);
            loadPlaces("religion.place_of_worship.christianity");
        });
    }
    if (savedBtn) {
        savedBtn.addEventListener("click", (event) => {
            console.log("Saved Locations button clicked");
            resetButtonColors(savedBtn);
            const userId = getUserId();
            userId.then(getSavedLocations).then(renderPlaces);
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener("click", (event) => {
            console.log("Clear Map button clicked");
            resetButtonColors(clearBtn);
            resultsLayer.clearLayers();
        });
    }
    if (saveLocBtn) {
        saveLocBtn.addEventListener("click", async (event) => {
            console.log("Save Location button clicked");
            if (!chosenFeature) {
                window.toast.error("Please select a location on the map first");
                return;
            }
            try {
                const response = await fetch('/api/save-location/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        latitude: chosenFeature.geometry.coordinates[1],
                        longitude: chosenFeature.geometry.coordinates[0],
                        properties: chosenFeature.properties
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    window.toast.success("Location saved successfully!");
                    console.log("Saved location:", data);
                }
                else {
                    const error = await response.json();
                    window.toast.error(error.error || "Failed to save location");
                }
            }
            catch (error) {
                console.error("Error saving location:", error);
                window.toast.error("An error occurred while saving the location");
            }
        });
    }
    async function loadPlaces(cats) {
        const bounds = my_map.getBounds();
        const rect = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        const searchUrl = `https://api.geoapify.com/v2/places?categories=${cats}&filter=rect:${rect}&limit=100&apiKey=09d5b6e52d8946efab4b009650b3b211`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Goapify API error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Places loaded: ", data);
        renderPlaces(data);
    }
    function markericonUrl(iconName = "map-marker", color = "greenyellow") {
        const icon = encodeURIComponent(iconName);
        const tint = encodeURIComponent(color);
        return `https://api.geoapify.com/v2/icon?type=material&color=${tint}&size=64&apiKey=09d5b6e52d8946efab4b009650b3b211`;
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
                popupAnchor: [1, -10]
            });
            const name = properties?.name || properties?.address_line1 || "Unnamed place";
            const address = properties?.address_line2 || properties?.formal || "";
            L.marker([lat, lng], { icon: my_icon })
                .bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(address)}`)
                .addTo(resultsLayer)
                .addEventListener("click", () => {
                chosenFeature = f;
                console.log(f.properties.name);
            });
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
    function resetButtonColors(btn) {
        healthBtn.style.backgroundColor = "#333333";
        socialBtn.style.backgroundColor = "#333333";
        childcareBtn.style.backgroundColor = "#333333";
        storeBtn.style.backgroundColor = "#333333";
        churchBtn.style.backgroundColor = "#333333";
        savedBtn.style.backgroundColor = "#333333";
        clearBtn.style.backgroundColor = "#333333";
        btn.style.backgroundColor = "#4CAF50";
    }
    async function getLocation() {
        let latitude;
        let longitude;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log(latitude);
                console.log(longitude);
                return [latitude, longitude];
            }, (error) => {
                console.error(`Error in getting location: ${error}`);
            });
        }
        else {
            console.error("This browser does not support geolocation.");
        }
        return [latitude, longitude];
    }
});
async function getUserId() {
    const response = await fetch('/api/user-info/');
    if (!response.ok) {
        throw new Error(`DB Error: ${response.statusText}`);
    }
    const userData = await response.json();
    return userData.id;
}
async function getSavedLocations(userId) {
    const response = await fetch(`/api/get-locations/${userId}/`);
    if (!response.ok) {
        throw new Error(`DB Error: ${response.statusText}`);
    }
    let data = await response.json();
    let featureArray = [data.count];
    let index = 0;
    for (const result of data.results) {
        const feature = {
            type: "Feature",
            properties: {
                name: result.name,
                formal: result.formal,
                address_line1: result.address_line1,
                address_line2: result.address_line2
            },
            geometry: {
                type: "Point",
                coordinates: [result.longitude, result.latitude]
            }
        };
        featureArray[index] = feature;
        index++;
    }
    const locationData = {
        type: "FeatureCollection",
        features: featureArray
    };
    console.log(locationData);
    return locationData;
}
