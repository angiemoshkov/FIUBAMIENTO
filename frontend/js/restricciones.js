const URL_RESTRICCIONES = 'http://localhost:3000/api/v1/restricciones';
const URL_SPOTS = 'http://localhost:3000/api/v1/spots';
const DIAS = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
};

// Al cargar la página, leemos el spot_id de la URL
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const spot_id = params.get('spot_id');

    if (!spot_id) {
        document.getElementById('body-restricciones').innerHTML = 
            '<tr><td colspan="7">Error: no se especificó un spot.</td></tr>';
        return;
    }

    document.getElementById('form-spot-id').value = spot_id;
    cargarRestriccionesYDireccion(spot_id);
});

async function cargarRestriccionesYDireccion(spot_id) {
    try {
        const [resSpot, resRestricciones] = await Promise.all([
            fetch(`${URL_SPOTS}/${spot_id}`),
            fetch(`${URL_RESTRICCIONES}?spot_id=${spot_id}`)
        ]);

        const spot = await resSpot.json();
        const restricciones = await resRestricciones.json();

        document.getElementById('titulo-pagina').textContent = 
            `Restricciones — ${spot.direccion_aproximada}`;

        renderizarTabla(restricciones, spot.direccion_aproximada);
    } catch (error) {
        document.getElementById('body-restricciones').innerHTML = 
            '<tr><td colspan="7">Error al cargar las restricciones.</td></tr>';
    }
}

function renderizarTabla(restricciones, direccion) {
    const tbody = document.getElementById('body-restricciones');
    tbody.innerHTML = '';

    if (restricciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay restricciones para este spot.</td></tr>';
        return;
    }

    restricciones.forEach(r => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${direccion}</td>
            <td>${r.tipo ?? '-'}</td>
            <td>${DIAS[r.dia_semana] ?? r.dia_semana}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.hora_fin}</td>
            <td>${r.descripcion ?? '-'}</td>
            <td>
                <button class="button is-small is-warning" onclick="editarRestriccion(${r.id}, '${r.tipo}', ${r.dia_semana}, '${r.hora_inicio}', '${r.hora_fin}', '${r.descripcion ?? ''}')">Editar</button>
                <button class="button is-small is-danger" onclick="confirmarEliminar(${r.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function mostrarFormulario() {
    document.getElementById('formulario-restriccion').style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
}

function ocultarFormulario() {
    document.getElementById('formulario-restriccion').style.display = 'none';
    limpiarFormulario();
}

function editarRestriccion(id, tipo, dia, hora_inicio, hora_fin, descripcion) {
    document.getElementById('restriccion-id').value = id;
    document.getElementById('form-tipo').value = tipo;
    document.getElementById('form-dia').value = dia;
    document.getElementById('form-hora-inicio').value = hora_inicio.slice(0, 5);
    document.getElementById('form-hora-fin').value = hora_fin.slice(0, 5);
    document.getElementById('form-descripcion').value = descripcion;
    document.getElementById('form-titulo').textContent = 'Editar restricción';
    mostrarFormulario();
}

async function guardarRestriccion() {
    const id = document.getElementById('restriccion-id').value;
    const spot_id = document.getElementById('form-spot-id').value;
    const tipo = document.getElementById('form-tipo').value;
    const dia_semana = document.getElementById('form-dia').value;
    const hora_inicio = document.getElementById('form-hora-inicio').value;
    const hora_fin = document.getElementById('form-hora-fin').value;
    const descripcion = document.getElementById('form-descripcion').value;

    if (!tipo || !dia_semana || !hora_inicio || !hora_fin) {
        alert('Completá todos los campos obligatorios');
        return;
    }

    if (hora_inicio >= hora_fin) {
        alert("'hora_inicio' debe ser anterior a 'hora_fin'. Una restricción que cruza las 00:00 se carga como dos o más: una hasta las 23:59 y otra desde las 00:00, ya que son 2 dias diferentes o más. Volvé a cargar la restriccion correctamente.");
        return;
    }

    const body = { spot_id: Number(spot_id), tipo, dia_semana: Number(dia_semana), hora_inicio, hora_fin, descripcion };

    let response;
    if (id) {
        response = await fetch(`${URL_RESTRICCIONES}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } else {
        response = await fetch(URL_RESTRICCIONES, {
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

    alert('¡Restricción guardada!');
    ocultarFormulario();
    const spot_id_actual = document.getElementById('form-spot-id').value;
    cargarRestriccionesYDireccion(spot_id_actual);
}

let restriccionAEliminarId = null;

function confirmarEliminar(id) {
    restriccionAEliminarId = id;
    document.getElementById('modal-confirmar').classList.add('is-active');
}

async function eliminarRestriccion() {
    if (!restriccionAEliminarId) return;
    const response = await fetch(`${URL_RESTRICCIONES}/${restriccionAEliminarId}`, { method: 'DELETE' });
    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }
    cerrarModalConfirmar();
    const spot_id = document.getElementById('form-spot-id').value;
    cargarRestriccionesYDireccion(spot_id);
}

function cerrarModalConfirmar() {
    restriccionAEliminarId = null;
    document.getElementById('modal-confirmar').classList.remove('is-active');
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', eliminarRestriccion);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalConfirmar);

function limpiarFormulario() {
    document.getElementById('restriccion-id').value = '';
    document.getElementById('form-tipo').value = '';
    document.getElementById('form-dia').value = '';
    document.getElementById('form-hora-inicio').value = '';
    document.getElementById('form-hora-fin').value = '';
    document.getElementById('form-descripcion').value = '';
    document.getElementById('form-titulo').textContent = 'Agregar restricción';
}
