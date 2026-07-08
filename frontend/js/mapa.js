
const map = L.map('map').setView([-34.6177, -58.3683], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const fiubaMarker = L.marker([-34.6177, -58.3683]).addTo(map);
fiubaMarker.bindPopup("<b>Sede Paseo Colón</b><br>Zonas de estacionamiento alrededor.").openPopup();

setTimeout(() => { map.invalidateSize(); }, 100);

async function cargarSpots() {
    const responseSpots = await fetch('http://localhost:3000/api/v1/spots');
    const spotsDesdeBaseDeDatos = await responseSpots.json();

    const spotsConEstado = await Promise.all(spotsDesdeBaseDeDatos.map(async (spot) => {
        try {
            const responseReportes = await fetch(`http://localhost:3000/api/v1/restricciones?spot_id=${spot.id}`);
            const restricciones = await responseReportes.json();
            
            let estadoActual = 'sin_informacion';
            if (restricciones && restricciones.length > 0) {
                estadoActual = restricciones[restricciones.length - 1].estado_reportado || 'sin_informacion';
            }
            
            return { ...spot, estadoActual };
        } catch (error) {
            return { ...spot, estadoActual: 'sin_informacion' };
        }
    }));

    // Obtenemos la plantilla HTML una sola vez
    const template = document.getElementById('popup-template');

    spotsConEstado.forEach(spot => {
        let colorFinal = '#95a5a6';
        let textoEstado = 'Sin información';

        if (spot.estadoActual === 'ocupado') { colorFinal = '#e74c3c'; textoEstado = 'Ocupado'; }
        else if (spot.estadoActual === 'libre') { colorFinal = '#2ecc71'; textoEstado = 'Libre'; }
        else if (spot.estadoActual === 'me_yendo') { colorFinal = '#f1c40f'; textoEstado = 'Me yendo'; }

        // Armamos las URLs
        const urlRestricciones = `restricciones.html?spot_id=${spot.id}`;
        const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitud},${spot.longitud}`;

        // 1. Clonamos el contenido de la plantilla
        const popupContent = template.content.cloneNode(true);

        // 2. Rellenamos los datos buscando por clase
        popupContent.querySelector('.popup-direccion').textContent = spot.direccion_aproximada;
        popupContent.querySelector('.popup-estado strong').textContent = textoEstado;
        popupContent.querySelector('.btn-restricciones').href = urlRestricciones;
        popupContent.querySelector('.btn-maps').href = urlGoogleMaps;

        // 3. Leaflet necesita un contenedor Div real, así que envolvemos el fragmento clonado
        const popupDiv = document.createElement('div');
        popupDiv.appendChild(popupContent);

        // 4. Dibujamos el punto y le pasamos el elemento HTML (popupDiv) en lugar de un string
        L.circleMarker([spot.latitud, spot.longitud], {
            radius: 6,
            fillColor: colorFinal,
            color: "#ffffff",
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map).bindPopup(popupDiv);
    });
}

cargarSpots();
