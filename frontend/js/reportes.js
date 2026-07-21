const URL_REPORTES = 'http://localhost:3000/api/v1/reportes';

async function cargarReportes() {
    const response = await fetch(URL_REPORTES);
    const reportes = await response.json();
    renderizarTabla(reportes);
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
}

function renderizarTabla(reportes) {
    const tbody = document.getElementById('body-reportes');
    tbody.innerHTML = '';

    if (reportes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No hay reportes cargados</td></tr>';
        return;
    }

    reportes.forEach(r => {
        const fila = document.createElement('tr');
        if (r.estado_actual === 'sin_informacion_reciente') {
            fila.classList.add('fila-vencida');
        }
        fila.innerHTML = `
            <td>${r.direccion_aproximada}</td>
            <td><span class="estado estado-${r.estado_reportado}">${r.estado_reportado}</span></td>
            <td><span class="estado estado-${r.estado_actual}">${r.estado_actual.replaceAll('_', ' ')}</span></td>
            <td class="contador-libre">${r.veces_libre}</td>
            <td class="contador-ocupado">${r.veces_ocupado}</td>
            <td>${formatearFecha(r.fecha_creacion)}</td>
            <td>${formatearFecha(r.fecha_expiracion)}</td>
            <td>
                <button class="button is-small is-danger" onclick="confirmarEliminar(${r.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

let reporteAEliminarId = null;

function confirmarEliminar(id) {
    reporteAEliminarId = id;
    document.getElementById('modal-confirmar').classList.add('is-active');
}

async function eliminarReporte() {
    if (!reporteAEliminarId) return;
    const response = await fetch(`${URL_REPORTES}/${reporteAEliminarId}`, { method: 'DELETE' });
    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }
    cerrarModalConfirmar();
    cargarReportes();
}

function cerrarModalConfirmar() {
    reporteAEliminarId = null;
    document.getElementById('modal-confirmar').classList.remove('is-active');
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarReporte);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalConfirmar);

cargarReportes();
