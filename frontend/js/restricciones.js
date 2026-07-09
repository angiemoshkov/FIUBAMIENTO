// Se ejecuta apenas carga la página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Leemos los parámetros de la URL (ej: ?spot_id=5)
    const parametros = new URLSearchParams(window.location.search);
    const spot_id_url = parametros.get('spot_id');

    // 2. Si viene un ID en la URL, lo buscamos automáticamente
    if (spot_id_url) {
        // Opcional: Rellenamos el input para que el usuario vea qué ID se buscó
        const input = document.getElementById('spot-id-input');
        if (input) input.value = spot_id_url;
        
        // Ejecutamos la búsqueda
        ejecutarBusqueda(spot_id_url);
    }
});

// Función para el botón manual del buscador
async function buscarRestricciones() {
    const spot_id_input = document.getElementById('spot-id-input').value;
    if (!spot_id_input) {
        alert('Ingresá un Spot ID');
        return;
    }
    ejecutarBusqueda(spot_id_input);
}

// Lógica central que hace el Fetch y dibuja la tabla
async function ejecutarBusqueda(spot_id) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/restricciones?spot_id=${spot_id}`);
        const restricciones = await response.json();

        const tbody = document.getElementById('body-restricciones');
        tbody.innerHTML = '';

        if (!restricciones || restricciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay restricciones para este spot</td></tr>';
            return;
        }

        for (const r of restricciones) {
            const fila = `<tr>
                <td>${r.spot_id}</td>
                <td>${r.tipo_restriccion || '-'}</td>
                <td>${r.dia_semana || '-'}</td>
                <td>${r.hora_inicio || '-'}</td>
                <td>${r.hora_fin || '-'}</td>
                <td>${r.descripcion ?? '-'}</td>
            </tr>`;
            tbody.innerHTML += fila;
        }
    } catch (error) {
        console.error("Error al buscar las restricciones:", error);
        document.getElementById('body-restricciones').innerHTML = '<tr><td colspan="6">Error al cargar datos</td></tr>';
    }
}
