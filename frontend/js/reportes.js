
document.addEventListener('DOMContentLoaded', () => {

    let reporteAEditarId = null; 
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

async function cargarReportes(spotId) {
    const container = document.getElementById('reportes-container');
    container.innerHTML = '<div class="loader">Cargando datos...</div>';

    try {
        const response = await fetch(`http://localhost:3000/api/v1/reportes?spot_id=${spotId}`);
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
        const div = document.createElement('div');
        div.className = `reporte-card ${reporte.estado_reportado}`;

        let textoFecha = "Fecha desconocida";
        if (reporte.fecha_creacion) { 
            const fechaObj = new Date(reporte.fecha_creacion);
            textoFecha = fechaObj.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
        }

        div.innerHTML = `
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
        const btnEliminar = div.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
                eliminarReporte(reporte.id, spotId);
            }
        });

        container.appendChild(div);
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



function configurarModal(spotId) {
    const btnCerrar = document.getElementById('btn-cerrar-modal');
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

});