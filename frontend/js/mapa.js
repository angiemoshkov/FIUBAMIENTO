
const map = L.map('map').setView([-34.6177, -58.3683], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const fiubaMarker = L.marker([-34.6177, -58.3683]).addTo(map);
fiubaMarker.bindPopup("<b>Sede Paseo Colón</b><br>Zonas de estacionamiento alrededor.").openPopup();

setTimeout(() => { map.invalidateSize(); }, 100);

async function cargarSpots() {
    try {
        const responseSpots = await fetch('http://localhost:3000/api/v1/spots');
        const spotsDesdeBaseDeDatos = await responseSpots.json();

        console.log("Datos recibidos de la API:", spotsDesdeBaseDeDatos);

        const template = document.getElementById('popup-template');

        console.log("Elemento template encontrado:", template);

        if (spotsDesdeBaseDeDatos.length === 0) {
            console.warn("Ojo: El array de spots está vacío []. No hay nada que dibujar.");
        }

        const configuracionEstados = {
            'ocupado': { color: '#e74c3c', texto: 'Ocupado' },
            'libre': { color: '#2ecc71', texto: 'Libre' },
            'restringido': { color: '#f1c40f', texto: 'Restringido' },
            'sin_informacion_reciente': { color: '#95a5a6', texto: 'Sin información reciente' }
        };

        // Limpiamos marcadores previos si es necesario (depende de tu setup de Leaflet)
        // map.eachLayer(...); 

        spotsDesdeBaseDeDatos.forEach(spot => {

            console.log(`Dibujando spot ID: ${spot.id} en lat: ${spot.latitud} (${typeof spot.latitud}), lng: ${spot.longitud}`);

            const estadoKey = spot.estado || 'sin_informacion_reciente';
            const infoEstado = configuracionEstados[estadoKey] || configuracionEstados['sin_informacion_reciente'];

            // URLs de navegación
            const urlReportesPagina = `reportes.html?spot_id=${spot.id}`;
            const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitud},${spot.longitud}`;

            // 1. Clonamos la plantilla
            const popupContent = template.content.cloneNode(true);

            // 2. Rellenamos la información básica
            popupContent.querySelector('.popup-direccion').textContent = spot.direccion_aproximada;
            popupContent.querySelector('.popup-estado strong').textContent = infoEstado.texto;
            popupContent.querySelector('.btn-maps').href = urlGoogleMaps;
            
            // FUNCIONALIDAD 3: Botón que redirige a la página de reportes propia del spot
            popupContent.querySelector('.btn-ver-reportes').href = urlReportesPagina;

            // FUNCIONALIDAD 1 y 2: Capturamos los botones de acción rápida
            const btnOcupado = popupContent.querySelector('.btn-marcar-ocupado');
            const btnLibre = popupContent.querySelector('.btn-marcar-libre');

            // Escuchamos los clicks y disparamos nuestra función inteligente
            btnOcupado.addEventListener('click', (e) => {
                e.preventDefault(); 
                gestionarReporte(spot, 'ocupado');
            });

            btnLibre.addEventListener('click', (e) => {
                e.preventDefault();
                gestionarReporte(spot, 'libre');
            });

            // 3. Envoltura para Leaflet
            const popupDiv = document.createElement('div');
            popupDiv.appendChild(popupContent);

            // 4. Dibujamos en el mapa
            L.circleMarker([spot.latitud, spot.longitud], {
                radius: 6,
                fillColor: infoEstado.color,
                color: "#ffffff",
                weight: 2,
                fillOpacity: 0.9
            }).addTo(map).bindPopup(popupDiv);
        });
    } catch (error) {
        console.error("Error al cargar o procesar los spots:", error);
    }
}

console.log("Llamando a cargarSpots()..."); // <-- Fuera de todo
cargarSpots();