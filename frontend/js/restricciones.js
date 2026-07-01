async function buscarRestricciones() {
    const spot_id = document.getElementById('spot-id-input').value;

    if (!spot_id) {
        alert('Ingresá un Spot ID');
        return;
    }

    const response = await fetch(`http://localhost:3000/api/v1/restricciones?spot_id=${spot_id}`);
    const restricciones = await response.json();

    const tbody = document.getElementById('body-restricciones');
    tbody.innerHTML = '';

    for (const r of restricciones) {
        const fila = `<tr>
            <td>${r.spot_id}</td>
            <td>${r.tipo_restriccion}</td>
            <td>${r.dia_semana}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.hora_fin}</td>
            <td>${r.descripcion ?? '-'}</td>
        </tr>`;
        tbody.innerHTML += fila;
    }

    if (restricciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay restricciones para este spot</td></tr>';
    }
}