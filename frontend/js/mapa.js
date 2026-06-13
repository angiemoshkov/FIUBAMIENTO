// 1. Inicializar el mapa centrado en FIUBA (Paseo Colón) con un zoom de 16
const map = L.map('map').setView([-34.6177, -58.3683], 16);

// 2. Cargar la "capa" de diseño del mapa desde OpenStreetMap (los dibujos de las calles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Agregar un pin (marcador) de prueba en la puerta de la facultad
const fiubaMarker = L.marker([-34.6177, -58.3683]).addTo(map);

// 4. Agregarle un cartelito (popup) al hacerle clic al pin
fiubaMarker.bindPopup("<b>Sede Paseo Colón</b><br>Zonas de estacionamiento alrededor.").openPopup();

// Fuerza a Leaflet a recalcular el tamaño completo de la pantalla
setTimeout(() => { map.invalidateSize(); }, 100);