
const map = L.map('map').setView([-34.6177, -58.3683], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);



const fiubaMarker = L.marker([-34.6177, -58.3683]).addTo(map);
fiubaMarker.bindPopup("<b>Sede Paseo Colón</b><br>Zonas de estacionamiento alrededor.").openPopup();

setTimeout(() => { map.invalidateSize(); }, 100);



// Logica de Crear un Nuevo spot desde la Navbar

let modoCreacionActivo = false;
let popupCreacionTemporal = null;

document.getElementById('btn-activar-creacion').addEventListener('click', function() {
    modoCreacionActivo = !modoCreacionActivo;
    
    if (modoCreacionActivo) {
        this.style.backgroundColor = '#e74c3c'; 
        this.textContent = 'Cancelar Creación';
        document.getElementById('map').style.cursor = 'crosshair'; 
        alert('Haz clic en cualquier punto del mapa para ubicar el nuevo spot.');
    } else {
        desactivarModoCreacion();
    }
});



function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
    const radioTierraMetros = 6371000; 
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radioTierraMetros * c;
}

// Escuchamos los clics en el mapa de Leaflet (Corregido: una sola declaración)
map.on('click', function(e) {
    if (!modoCreacionActivo) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // COORDENADAS DE TU FACULTAD
    const FACULTAD_LAT = -34.61765;
    const FACULTAD_LNG = -58.36831;

    // Calculamos la distancia entre el click y la facultad
    const distanciaAFacultad = calcularDistanciaMetros(lat, lng, FACULTAD_LAT, FACULTAD_LNG);

    // CONTROL DE RESTRICCIÓN: Si está a MÁS de 300 metros, bloqueamos
    if (distanciaAFacultad > 300) {
        alert(`Solo está permitido agregar spots dentro del radio de la Facultad de Ingeniería (máximo 300 metros). Estás a ${Math.round(distanciaAFacultad)} metros.`);
        return; 
    }

    const templateNuevo = document.getElementById('nuevo-spot-template');
    const formulario = templateNuevo.content.cloneNode(true);
    
    const contenedorDiv = document.createElement('div');
    contenedorDiv.appendChild(formulario);

    // Creamos y abrimos el popup en las coordenadas clickeadas (Corregido: una sola vez)
    popupCreacionTemporal = L.popup()
        .setLatLng([lat, lng])
        .setContent(contenedorDiv)
        .openOn(map);

    // Vinculamos el evento del botón guardar que está DENTRO del popup
    contenedorDiv.querySelector('#btn-guardar-spot').addEventListener('click', async function(event) {
        event.preventDefault();

        const direccion = contenedorDiv.querySelector('#ins-direccion').value.trim();
        const referencia = contenedorDiv.querySelector('#ins-referencia').value.trim();

        if (!direccion || !referencia) {
            alert('Ambos campos son obligatorios para crear el spot.');
            return;
        }

        const nuevoSpotBody = {
            latitud: lat,
            longitud: lng,
            direccion_aproximada: direccion,
            referencia: referencia
        };

        try {
            const response = await fetch('http://localhost:3000/api/v1/spots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoSpotBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido del servidor');
            }

            alert('¡Spot creado exitosamente!');
            
            map.closePopup(popupCreacionTemporal); 
            desactivarModoCreacion();             
            await cargarSpots();                  

        } catch (error) {
            console.error('Error al guardar el spot:', error);
            alert(`No se pudo crear: ${error.message}`);
        }
    });
});

// Función auxiliar para resetear el Navbar y el comportamiento del mapa
function desactivarModoCreacion() {
    modoCreacionActivo = false;
    const btnNavbar = document.getElementById('btn-activar-creacion');
    btnNavbar.style.backgroundColor = ''; 
    btnNavbar.textContent = 'Agregar nuevo Spot';
    document.getElementById('map').style.cursor = ''; 
}

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