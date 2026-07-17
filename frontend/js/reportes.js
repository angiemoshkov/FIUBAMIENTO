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
        } 
        // CONDICIÓN 2: Ocupado o Libre -> PUT (Modificar existente)
        else if (spot.estado === 'ocupado' || spot.estado === 'libre') {
            // Es vital que el backend te mande el ID del reporte actual en el objeto spot
            if (!spot.ultimo_reporte_id) {
                console.error("Error: No se puede hacer PUT porque falta el 'ultimo_reporte_id' en el spot.");
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