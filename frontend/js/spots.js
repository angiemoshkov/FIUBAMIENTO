const url = "http://localhost:3000/api/v1/spots";
const response = await fetch(url);
const spots = await response.json();


spots.forEach(spot => {
    const row = document.createElement("tr");
    const latitud = document.createElement("td");
    const longitud = document.createElement("td");
    const ubicacion = document.createElement("td");
    const estado_actual = document.createElement("td");
    const ultima_actualizacion = document.createElement("td");

    latitud.textContent = spot.latitud;
    longitud.textContent = spot.longitud;
    ubicacion.textContent = spot.direccion_aproximada;
    estado_actual.textContent = spot.estado_actual;
    ultima_actualizacion.textContent = spot.ultima_actualizacion;

    row.appendChild(latitud);
    row.appendChild(longitud);
    row.appendChild(ubicacion);
    row.appendChild(estado_actual);
    row.appendChild(ultima_actualizacion);

    document.getElementById("row").appendChild(row);

    const botonVer = document.createElement("a");
    botonVer.textContent = "Ver";
    botonVer.href = `./spot.html?id=${spot.id}`;
    row.appendChild(botonVer);

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", async () => {
        const deleteUrl = `http://localhost:3000/api/v1/spots/${spot.id}`;
        await fetch(deleteUrl, { method: "DELETE" });
        row.remove();
    });
    row.appendChild(botonEliminar);

    const botonAgregar = document.createElement("a");
    botonAgregar.textContent = "Agregar";
    botonAgregar.href = `./add_spot.html`;
    row.appendChild(botonAgregar);
});

