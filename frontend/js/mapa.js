
const map = L.map('map').setView([-34.6177, -58.3683], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

setTimeout(() => { map.invalidateSize(); }, 100);

async function cargarSpots() {
    const response = await fetch('http://localhost:3000/api/v1/spots');
    const spotsDesdeBaseDeDatos = await response.json();

    spotsDesdeBaseDeDatos.forEach(spot => {
        const colorFinal = (spot.estado_actual === 'ocupado') ? '#e74c3c' : '#2ecc71';
        L.circleMarker([spot.latitud, spot.longitud], {
            radius: 6,
            fillColor: colorFinal,
            color: "#ffffff",
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map).bindPopup(`<b>${spot.direccion_aproximada}</b><br>Estado: ${(spot.estado_actual === 'ocupado') ? 'Ocupado' : 'Libre'}`);
    });
}

cargarSpots();