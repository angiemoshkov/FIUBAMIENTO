
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

map.on('click', function(e) {
    if (!modoCreacionActivo) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const FACULTAD_LAT = -34.61765;
    const FACULTAD_LNG = -58.36831;

    const distanciaAFacultad = calcularDistanciaMetros(lat, lng, FACULTAD_LAT, FACULTAD_LNG);

    //Si está a MÁS de 300 metros, bloqueamos
    if (distanciaAFacultad > 300) {
        alert(`Solo está permitido agregar spots dentro del radio de la Facultad de Ingeniería (máximo 300 metros). Estás a ${Math.round(distanciaAFacultad)} metros.`);
        return; 
    }

    const templateNuevo = document.getElementById('nuevo-spot-template');
    const formulario = templateNuevo.content.cloneNode(true);
    
    const contenedorDiv = document.createElement('div');
    contenedorDiv.appendChild(formulario);

    popupCreacionTemporal = L.popup()
        .setLatLng([lat, lng])
        .setContent(contenedorDiv)
        .openOn(map);

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
            
            map.closePopup(popupCreacionTemporal); 
            desactivarModoCreacion();             
            await cargarSpots();                  

        } catch (error) {
            console.error('Error al guardar el spot:', error);
            alert(`No se pudo crear: ${error.message}`);
        }
    });
});

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

        spotsDesdeBaseDeDatos.forEach(spot => {

            console.log(`Dibujando spot ID: ${spot.id} en lat: ${spot.latitud} (${typeof spot.latitud}), lng: ${spot.longitud}`);

            const estadoKey = spot.estado || 'sin_informacion_reciente';
            const infoEstado = configuracionEstados[estadoKey] || configuracionEstados['sin_informacion_reciente'];

            const urlReportesPagina = `reportes.html?spot_id=${spot.id}`;
            const urlRestricciones = `restricciones.html?spot_id=${spot.id}`;
            const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitud},${spot.longitud}`;

            const popupContent = template.content.cloneNode(true);

            popupContent.querySelector('.popup-direccion').textContent = spot.direccion_aproximada;
            popupContent.querySelector('.popup-estado strong').textContent = infoEstado.texto;
            popupContent.querySelector('.btn-maps').href = urlGoogleMaps;
            
            popupContent.querySelector('.btn-ver-reportes').href = urlReportesPagina;
            popupContent.querySelector('.btn-restricciones').href = urlRestricciones;

            const btnOcupado = popupContent.querySelector('.btn-marcar-ocupado');
            const btnLibre = popupContent.querySelector('.btn-marcar-libre');

            btnOcupado.addEventListener('click', (e) => {
                e.preventDefault(); 
                gestionarReporte(spot, 'ocupado');
            });

            btnLibre.addEventListener('click', (e) => {
                e.preventDefault();
                gestionarReporte(spot, 'libre');
            });

            const popupDiv = document.createElement('div');
            popupDiv.appendChild(popupContent);

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

cargarSpots();