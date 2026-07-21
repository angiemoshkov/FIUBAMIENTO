const map = L.map('map').setView([-34.6177, -58.3683], 17);
const spotsLayer = L.layerGroup().addTo(map);
const URL_SPOTS = 'http://localhost:3000/api/v1/spots';

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const fiubaMarker = L.marker([-34.6177, -58.3683]).addTo(map);
fiubaMarker.bindPopup("<b>Sede Paseo Colón</b><br>Zonas de estacionamiento alrededor.").openPopup();

setTimeout(() => { map.invalidateSize(); }, 100);



// Logica de Crear un Nuevo spot desde la Navbar

let modoCreacionActivo = false;
let modoMoverActivo = false;
let spotAEliminar = null;
let popupCreacionTemporal = null;
let popupEdicionTemporal = null;
let spotOriginal = null;
let spotEnEdicion = null;

document.getElementById('btn-activar-creacion').addEventListener('click', function() {
    if (modoMoverActivo) {
        desactivarModoMover();
        abrirFormularioEdicion();
        return;
    }

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

function estaDentroDelRadio(lat, lng) {
    const FACULTAD_LAT = -34.61765;
    const FACULTAD_LNG = -58.36831;

    const distanciaAFacultad = calcularDistanciaMetros(lat, lng, FACULTAD_LAT, FACULTAD_LNG);

    //Si está a MÁS de 300 metros, bloqueamos
    if (distanciaAFacultad > 300) {
        alert(`Solo está permitido ubicar spots dentro del radio de la Facultad de Ingeniería (máximo 300 metros). Estás a ${Math.round(distanciaAFacultad)} metros.`);
        return false;
    }

    return true;
}

map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (modoMoverActivo) {
        if (!estaDentroDelRadio(lat, lng)) return;

        spotEnEdicion.latitud = lat;
        spotEnEdicion.longitud = lng;
        desactivarModoMover();
        abrirFormularioEdicion();
        return;
    }

    if (!modoCreacionActivo) return;

    if (!estaDentroDelRadio(lat, lng)) return;

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

function seMovioElSpot() {
    return Number(spotOriginal.latitud) !== Number(spotEnEdicion.latitud) ||
           Number(spotOriginal.longitud) !== Number(spotEnEdicion.longitud);
}

function abrirEdicion(spot) {
    spotOriginal = { ...spot };
    spotEnEdicion = { ...spot };
    abrirFormularioEdicion();
}

function abrirFormularioEdicion() {
    const template = document.getElementById('editar-spot-template');
    const contenedorDiv = document.createElement('div');
    contenedorDiv.appendChild(template.content.cloneNode(true));

    const inputDireccion = contenedorDiv.querySelector('.edit-direccion');
    const inputReferencia = contenedorDiv.querySelector('.edit-referencia');

    inputDireccion.value = spotEnEdicion.direccion_aproximada;
    inputReferencia.value = spotEnEdicion.referencia;

    if (seMovioElSpot()) {
        contenedorDiv.querySelector('.aviso-movido').style.display = 'block';
    }

    contenedorDiv.querySelector('.btn-mover').addEventListener('click', function() {
        spotEnEdicion.direccion_aproximada = inputDireccion.value;
        spotEnEdicion.referencia = inputReferencia.value;
        activarModoMover();
    });

    contenedorDiv.querySelector('.btn-guardar-edicion').addEventListener('click', function() {
        spotEnEdicion.direccion_aproximada = inputDireccion.value;
        spotEnEdicion.referencia = inputReferencia.value;
        guardarEdicion();
    });

    popupEdicionTemporal = L.popup()
        .setLatLng([spotEnEdicion.latitud, spotEnEdicion.longitud])
        .setContent(contenedorDiv)
        .openOn(map);
}

function activarModoMover() {
    map.closePopup(popupEdicionTemporal);
    modoMoverActivo = true;

    const btnNavbar = document.getElementById('btn-activar-creacion');
    btnNavbar.style.backgroundColor = '#f39c12';
    btnNavbar.textContent = 'Cancelar movimiento';
    document.getElementById('map').style.cursor = 'crosshair';
}

function desactivarModoMover() {
    modoMoverActivo = false;

    const btnNavbar = document.getElementById('btn-activar-creacion');
    btnNavbar.style.backgroundColor = '';
    btnNavbar.textContent = 'Agregar nuevo Spot';
    document.getElementById('map').style.cursor = '';
}

async function guardarEdicion() {
    const direccion = spotEnEdicion.direccion_aproximada.trim();
    const referencia = spotEnEdicion.referencia.trim();

    if (!direccion || !referencia) {
        alert('Ambos campos son obligatorios.');
        return;
    }

    try {
        const response = await fetch(`${URL_SPOTS}/${spotEnEdicion.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitud: spotEnEdicion.latitud,
                longitud: spotEnEdicion.longitud,
                direccion_aproximada: direccion,
                referencia: referencia
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error desconocido del servidor');
        }

        const resultado = await response.json();

        map.closePopup(popupEdicionTemporal);
        spotOriginal = null;
        spotEnEdicion = null;

        if (resultado.se_movio) {
            alert('El spot se movió: se borraron sus reportes y restricciones, y quedó sin información reciente.');
        }

        await cargarSpots();

    } catch (error) {
        console.error('Error al editar el spot:', error);
        alert(`No se pudo editar: ${error.message}`);
    }
}

async function gestionarReporte(spot, nuevoEstado) {
    const urlBase = 'http://localhost:3000/api/v1/reportes';

    try {
        // CONDICIÓN 1: Sin información reciente -> POST (Crear nuevo)
        if (spot.estado === 'sin_informacion_reciente') {
            const response = await fetch(urlBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spot_id: spot.id,
                    estado_reportado: nuevoEstado
                })
            });

            if (!response.ok) throw new Error('Error al crear el reporte nuevo');
            alert(`¡Reporte creado como ${nuevoEstado}!`);
        } 
        // CONDICIÓN 2: Ocupado o Libre -> PUT (Modificar existente)
        else if (spot.estado === 'ocupado' || spot.estado === 'libre') {
            if (!spot.ultimo_reporte_id) {
                alert("No se pudo actualizar el estado por falta de ID de reporte.");
                return;
            }

            const response = await fetch(`${urlBase}/${spot.ultimo_reporte_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado_reportado: nuevoEstado
                })
            });

            if (!response.ok) throw new Error('Error al actualizar el reporte existente');
            alert(`¡Estado actualizado a ${nuevoEstado}!`);
        }

        // Refrescamos el mapa para que pinte el nuevo color y estado calculado por el backend
        await cargarSpots();

    } catch (error) {
        console.error("Error al procesar la acción:", error);
        alert("Hubo un problema al comunicar el cambio al servidor.");
    }
}

function confirmarEliminar(id) {
    spotAEliminar = id;
    document.getElementById('modal-confirmar').classList.add('is-active');
}

async function eliminarSpot() {
    if (!spotAEliminar) return;
    const response = await fetch(`${URL_SPOTS}/${spotAEliminar}`, { method: 'DELETE'});
    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }
    cerrarModalConfirmar();
    await cargarSpots();
}

function cerrarModalConfirmar() {
    spotAEliminar = null;
    document.getElementById('modal-confirmar').classList.remove('is-active');
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

        spotsLayer.clearLayers();

        spotsDesdeBaseDeDatos.forEach(spot => {

            console.log(`Dibujando spot ID: ${spot.id} en lat: ${spot.latitud} (${typeof spot.latitud}), lng: ${spot.longitud}`);

            const estadoKey = spot.estado || 'sin_informacion_reciente';
            const infoEstado = configuracionEstados[estadoKey] || configuracionEstados['sin_informacion_reciente'];

            const urlRestricciones = `restricciones.html?spot_id=${spot.id}`;
            const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitud},${spot.longitud}`;

            const popupContent = template.content.cloneNode(true);

            popupContent.querySelector('.popup-direccion').textContent = spot.direccion_aproximada;
            popupContent.querySelector('.popup-referencia').textContent = spot.referencia;
            popupContent.querySelector('.popup-estado strong').textContent = infoEstado.texto;
            popupContent.querySelector('.btn-maps').href = urlGoogleMaps;
            
            popupContent.querySelector('.btn-restricciones').href = urlRestricciones;

            const btnOcupado = popupContent.querySelector('.btn-marcar-ocupado');
            const btnLibre = popupContent.querySelector('.btn-marcar-libre');
            const btnEliminar = popupContent.querySelector('.btn-eliminar');
            const btnEditar = popupContent.querySelector('.btn-editar');

            btnOcupado.addEventListener('click', (e) => {
                e.preventDefault(); 
                gestionarReporte(spot, 'ocupado');
            });

            btnLibre.addEventListener('click', (e) => {
                e.preventDefault();
                gestionarReporte(spot, 'libre');
            });

            btnEliminar.addEventListener('click', (e) => {
                e.preventDefault();
                confirmarEliminar(spot.id);
            });

            btnEditar.addEventListener('click', (e) => {
                e.preventDefault();
                map.closePopup();
                abrirEdicion(spot);
            });

            const popupDiv = document.createElement('div');
            popupDiv.appendChild(popupContent);

            L.circleMarker([spot.latitud, spot.longitud], {
                radius: 6,
                fillColor: infoEstado.color,
                color: "#ffffff",
                weight: 2,
                fillOpacity: 0.9
            }).addTo(spotsLayer).bindPopup(popupDiv);
        });
    } catch (error) {
        console.error("Error al cargar o procesar los spots:", error);
    }
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarSpot);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalConfirmar);

cargarSpots();