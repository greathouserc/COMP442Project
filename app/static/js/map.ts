//import L from 'leaflet/dist/leaflet.js';
// import { map, latLng, tileLayer, MapOptions, layerGroup, icon, marker, 
//     LatLngBounds, LayerGroup, LatLngExpression, geoJson, Browser} from 'leaflet';
//import 'leaflet/dist/leaflet.css';

declare const L: any;

//makes PacesJson type and assign it to geoJson
interface GeoJSONFeature{
    type: "Feature";
    properties: {
        name?: string;
        formatted?: string;
        address_line1?: string;
        address_line2?: string;
        [key: string]: any;
    };
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
}

interface GeoJSONData{
    type: "FatureCollection";
    features: GeoJSONFeature[];
}
    

document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById('insert_map') as HTMLAnchorElement | null;
    element.style = 'height:300px;';

    // const options: MapOptions = {
    //     center: L.latLng(41.1558, -80.0815),
    //     zoom: 10
    // };

    const my_map = L.map(element).setView([41.1558, -80.0815], 10);
    //API key
    const myAPIKey = "09d5b6e52d8946efab4b009650b3b211";

    //loadMap();
    var isRetina = L.Browser.retina;
    const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${myAPIKey}`
    const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${myAPIKey}`;

    //map tile layer
    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
        maxZoom: 20,
        id: 'osm-bright',
    }).addTo(my_map);

    let resultsLayer = L.layerGroup();

    //clicking each button adds a category to the search and the submission of the form reloads the search
    const healthBtn = document.getElementById("health-btn") as HTMLAnchorElement | null;
    const socialBtn = document.getElementById("social-btn") as HTMLAnchorElement | null;
    const clearBtn = document.getElementById("clear-btn") as HTMLAnchorElement | null;

    // // // let healthOn = false;

    let cats = "";

    if (healthBtn) {
        healthBtn.addEventListener("click", (event: MouseEvent) => {
            console.log("Healthcare button clicked");
            healthBtn.style.backgroundColor = "#4CAF50";
            socialBtn.style.backgroundColor = "#111111";
            clearBtn.style.backgroundColor = "#111111";
            cats = "healthcare.clinic_or_praxis";
            loadPlaces(cats);
        });
    }
    
    if (socialBtn) {
        socialBtn.addEventListener("click", (event: MouseEvent) => {
            console.log("Social Services button clicked");
            healthBtn.style.backgroundColor = "#111111";
            socialBtn.style.backgroundColor = "#4CAF50";
            clearBtn.style.backgroundColor = "#111111";
            cats = "service.social_facility";
            loadPlaces(cats);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", (event: MouseEvent) => {
            console.log("Clear Map button clicked");
            healthBtn.style.backgroundColor = "#111111";
            socialBtn.style.backgroundColor = "#111111";
            clearBtn.style.backgroundColor = "#4CAF50";
            resultsLayer.clearLayers();
        });
    }

    //         if(healthOn){
    //             if(categories === ""){
    //                 categories = "healthcare.clinic_or_praxis.gynaecology";
    //             }else{
    //                 categories = categories + ",healthcare.clinic_or_praxis.gynaecology";
    //             }
    //             healthOn = false;
    //         }else{
    //             healthOn = true;
    //         }

    //let searchUrl = "https://api.geoapify.com/v2/places?categories={categories}&filter=rect:${rect}&limit=100&apiKey={myAPIKey}"

    // async function loadMap(){
    //     const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={myAPIKey}";

    //     //map tile layer
    //     tileLayer(baseUrl, {
    //         attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
    //         maxZoom: 20,
    //         id: 'osm-bright',
    //     }).addTo(my_map);
    // }
    
    async function loadPlaces(cats: string){
        //const bounds: LatLngBounds = my_map.getBounds(); 41.1558, -80.0815 -78.09921757581298,38.73660286449031,-82.07762874146101,43.58987145915573&limit
        const bounds = my_map.getBounds();
        const rect = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        const searchUrl = `https://api.geoapify.com/v2/places?categories=${cats}&filter=rect:${rect}&limit=100&apiKey=09d5b6e52d8946efab4b009650b3b211`;

        const response = await fetch(searchUrl);
        if(!response.ok){
            throw new Error(`Goapify API error: ${response.statusText}`);
        }
        const data: GeoJSONData = await response.json();

        console.log("Places loaded: ", data);
        renderPlaces(data);
    }

    function markericonUrl(iconName = "map-marker", color = "greenyellow"){
        const icon = encodeURIComponent(iconName);
        const tint = encodeURIComponent(color);
        return `https://api.geoapify.com/v2/icon?type=material&color=${tint}&size=64&apiKey=09d5b6e52d8946efab4b009650b3b211`;
    }

    function renderPlaces(geojson: GeoJSONData | null){
        if(!geojson || !Array.isArray(geojson.features)) return;

        if(!L.resultsLayer){
            resultsLayer.clearLayers();
            resultsLayer = L.layerGroup().addTo(my_map);
        } else {
            resultsLayer.clearLayers();
        }

        geojson.features.forEach((f) => {
            const {geometry, properties} = f;
            if(!geometry || geometry.type !== "Point") return;

            const [lng, lat] = geometry.coordinates;

            const my_icon = L.icon({
                iconUrl: markericonUrl(),
                iconSize: [38, 55],
                iconAnchor: [18, 50],
                popupAnchor: [1, -10]
            });

            const name = properties?.name || properties?.address_line1 || "Unnamed place";
            const address = properties?.address_line2 || properties?.formal || "";

            L.marker([lat, lng], {icon: my_icon})
                .bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(address)}`)
                .addTo(resultsLayer);
        });
    }

    function escapeHtml(s = ""){
        return String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;")
    }


});

