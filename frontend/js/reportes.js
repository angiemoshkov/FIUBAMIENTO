
let reporteAEditarId = null; 
const URL_API_REPORTES = 'http://localhost:3000/api/v1/reportes';

document.addEventListener('DOMContentLoaded', () => {
    const parametrosUrl = new URLSearchParams(window.location.search);
    const spotId = parametrosUrl.get('spot_id');
    const spotInfoElement = document.getElementById('spot-info');
    const container = document.getElementById('reportes-container');

    if (!spotId) {
        spotInfoElement.textContent = "Error: No se ha especificado un Spot ID.";
        container.innerHTML = '';
        return;
    }

    spotInfoElement.textContent = `Viendo reportes para el Spot ID: ${spotId}`;
    
    cargarReportes(spotId);

    configurarModal(spotId);
});

async function cargarReportes(spotId) {
    const container = document.getElementById('reportes-container');
    container.innerHTML = '<div class="loader">Cargando datos...</div>';

    try {
        const response = await fetch(`${URL_API_REPORTES}?spot_id=${spotId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const reportes = await response.json();

        // Ordenar del más nuevo al más antiguo
        reportes.sort((a, b) => {
            const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : a.id;
            const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : b.id;
            return fechaB - fechaA; 
        });

        renderizarReportes(reportes, container, spotId);

    } catch (error) {
        console.error("Error al obtener los reportes:", error);
        container.innerHTML = `<div class="mensaje-vacio">Hubo un error al cargar los reportes.</div>`;
    }
}

function renderizarReportes(reportes, container, spotId) {
    container.innerHTML = '';

    if (reportes.length === 0) {
        container.innerHTML = `<div class="mensaje-vacio">Aún no hay reportes para este lugar.</div>`;
        return;
    }

    reportes.forEach(reporte => {
        const divCard = document.createElement('div');
        divCard.className = `reporte-card ${reporte.estado_reportado}`;

        let textoFecha = "Fecha desconocida";
        if (reporte.fecha_creacion) { 
            const fechaObj = new Date(reporte.fecha_creacion);
            textoFecha = fechaObj.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
        }

        divCard.innerHTML = `
            <div>
                <div class="reporte-estado">${reporte.estado_reportado}</div>
                <div class="reporte-fecha">Reportado el: ${textoFecha}</div>
                <div class="reporte-id">ID de reporte: #${reporte.id}</div>
            </div>
            <div class="reporte-acciones">
                <button class="btn-editar" data-id="${reporte.id}">Editar</button>
                <button class="btn-eliminar" data-id="${reporte.id}">Eliminar</button>
            </div>
        `;

        // Lógica del botón Eliminar
        const btnEliminar = divCard.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
                eliminarReporte(reporte.id, spotId);
            }
        });

        // Lógica del botón Editar
        const btnEditar = divCard.querySelector('.btn-editar');
        btnEditar.addEventListener('click', () => {
            abrirModal(reporte.id);
        });

        container.appendChild(divCard);
    });
}



async function eliminarReporte(reporteId, spotId) {
    try {
        const response = await fetch(`${URL_API_REPORTES}/${reporteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Recargamos la lista después de eliminar
            cargarReportes(spotId);
        } else {
            alert('Error al eliminar el reporte');
        }
    } catch (error) {
        console.error("Error en DELETE:", error);
    }
}

async function actualizarReporte(nuevoEstado, spotId) {
    if (!reporteAEditarId) return;

    try {
        const response = await fetch(`${URL_API_REPORTES}/${reporteAEditarId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_reportado: nuevoEstado })
        });

        if (response.ok) {
            cerrarModal();
           
            cargarReportes(spotId);
        } else {
            alert('Error al actualizar el reporte');
        }
    } catch (error) {
        console.error("Error en PUT:", error);
    }
}


function configurarModal(spotId) {
    const btnLibre = document.getElementById('btn-modal-libre');
    const btnOcupado = document.getElementById('btn-modal-ocupado');
    const btnCerrar = document.getElementById('btn-cerrar-modal');

    btnLibre.addEventListener('click', () => actualizarReporte('libre', spotId));
    btnOcupado.addEventListener('click', () => actualizarReporte('ocupado', spotId));
    btnCerrar.addEventListener('click', cerrarModal);
}

function abrirModal(id) {
    reporteAEditarId = id;
    document.getElementById('modal-editar').classList.remove('oculto');
}

function cerrarModal() {
    reporteAEditarId = null;
    document.getElementById('modal-editar').classList.add('oculto');
}


document.addEventListener('DOMContentLoaded', () => {
    const parametrosUrl = new URLSearchParams(window.location.search);
    const spotId = parametrosUrl.get('spot_id');
    

    if (spotId) {
        configurarModalCrear(spotId);
    }
});


function configurarModalCrear(spotId) {
    const modalCrear = document.getElementById('modal-crear');
    const btnAbrirCrear = document.getElementById('btn-abrir-crear');
    const btnCerrarCrear = document.getElementById('btn-cerrar-crear');
    const btnCrearLibre = document.getElementById('btn-crear-libre');
    const btnCrearOcupado = document.getElementById('btn-crear-ocupado');

    btnAbrirCrear.addEventListener('click', () => {
        modalCrear.classList.remove('oculto');
    });

    btnCerrarCrear.addEventListener('click', () => {
        modalCrear.classList.add('oculto');
    });

    btnCrearLibre.addEventListener('click', () => guardarNuevoReporte('libre', spotId));
    btnCrearOcupado.addEventListener('click', () => guardarNuevoReporte('ocupado', spotId));
}

async function guardarNuevoReporte(estado, spotId) {
    try {
        const response = await fetch('http://localhost:3000/api/v1/reportes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                spot_id: parseInt(spotId),
                estado_reportado: estado
            })
        });

        if (response.ok) {
            document.getElementById('modal-crear').classList.add('oculto');
            cargarReportes(spotId);
        } else {
            const errorData = await response.json();
            alert(`Error al crear el reporte: ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error("Error en POST /reportes:", error);
        alert("No se pudo conectar con el servidor para guardar el reporte.");
    }
}