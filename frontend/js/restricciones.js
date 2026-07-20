const URL_API = 'http://localhost:3000/api/v1/restricciones';

async function buscarRestricciones() {
    const spot_id = document.getElementById('spot-id-input').value;
    if (!spot_id) {
        alert('Ingresá un Spot ID');
        return;
    }
    const response = await fetch(`${URL_API}?spot_id=${spot_id}`);
    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }
    const restricciones = await response.json();
    renderizarTabla(restricciones);
}

function renderizarTabla(restricciones) {
    const tbody = document.getElementById('body-restricciones');
    tbody.innerHTML = '';

    if (restricciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay restricciones para este spot</td></tr>';
        return;
    }

    restricciones.forEach(r => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${r.spot_id}</td>
            <td>${r.tipo_restriccion ?? r.tipo ?? '-'}</td>
            <td>${r.dia_semana}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.hora_fin}</td>
            <td>${r.descripcion ?? '-'}</td>
            <td>
                <button class="button is-small is-warning" onclick="editarRestriccion(${r.id}, ${r.spot_id}, '${r.tipo_restriccion ?? r.tipo}', ${r.dia_semana}, '${r.hora_inicio}', '${r.hora_fin}', '${r.descripcion ?? ''}')">Editar</button>
                <button class="button is-small is-danger" onclick="confirmarEliminar(${r.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function editarRestriccion(id, spot_id, tipo, dia, hora_inicio, hora_fin, descripcion) {
    document.getElementById('restriccion-id').value = id;
    document.getElementById('form-spot-id').value = spot_id;
    document.getElementById('form-tipo').value = tipo;
    document.getElementById('form-dia').value = dia;
    document.getElementById('form-hora-inicio').value = hora_inicio.slice(0, 5);
    document.getElementById('form-hora-fin').value = hora_fin.slice(0, 5);
    document.getElementById('form-descripcion').value = descripcion;
    document.getElementById('form-titulo').textContent = 'Editar restricción';
    window.scrollTo(0, document.body.scrollHeight);
}

async function guardarRestriccion() {
    const id = document.getElementById('restriccion-id').value;
    const spot_id = document.getElementById('form-spot-id').value;
    const tipo = document.getElementById('form-tipo').value;
    const dia_semana = document.getElementById('form-dia').value;
    const hora_inicio = document.getElementById('form-hora-inicio').value;
    const hora_fin = document.getElementById('form-hora-fin').value;
    const descripcion = document.getElementById('form-descripcion').value;

    if (!spot_id || !tipo || !dia_semana || !hora_inicio || !hora_fin) {
        alert('Completá todos los campos obligatorios');
        return;
    }

    const body = { spot_id: Number(spot_id), tipo, dia_semana: Number(dia_semana), hora_inicio, hora_fin, descripcion };

    let response;
    if (id) {
        response = await fetch(`${URL_API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } else {
        response = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }

    alert("¡Restriccion guardada exitosamente!");
    limpiarFormulario();
}

let restriccionAEliminarId = null;

function confirmarEliminar(id) {
    restriccionAEliminarId = id;
    document.getElementById('modal-confirmar').classList.add('is-active');
}

async function eliminarRestriccion() {
    if (!restriccionAEliminarId) return;

    const response = await fetch(`${URL_API}/${restriccionAEliminarId}`, { method: 'DELETE' });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }
   
    cerrarModalConfirmar();
    buscarRestricciones();
}

function cerrarModalConfirmar() {
    restriccionAEliminarId = null;
    document.getElementById('modal-confirmar').classList.remove('is-active');
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarRestriccion);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalConfirmar);

function limpiarFormulario() {
    document.getElementById('restriccion-id').value = '';
    document.getElementById('form-spot-id').value = '';
    document.getElementById('form-tipo').value = '';
    document.getElementById('form-dia').value = '';
    document.getElementById('form-hora-inicio').value = '';
    document.getElementById('form-hora-fin').value = '';
    document.getElementById('form-descripcion').value = '';
    document.getElementById('form-titulo').textContent = 'Agregar restricción';
}