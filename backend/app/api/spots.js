import { Router } from "express";
import {
  createSpot,
  getAllSpots,
  getSpot,
  updateSpot,
  deleteSpot,
  limpiarDatosDelSpot,
} from "../db/spots.js";

export const endpointsSpots = Router();

const FIUBA_LAT = -34.61765;
const FIUBA_LNG = -58.36831;
const RADIO_MAXIMO_METROS = 300;

// Distancia en metros entre dos puntos de la Tierra (fórmula de Haversine, matemática JS plana).
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
  const distancia = calcularDistanciaMetros(Number(lat), Number(lng), FIUBA_LAT, FIUBA_LNG);
  return distancia <= RADIO_MAXIMO_METROS;
}

//---CRUD completo, respetando el orden de las siglas"---//

//CREATE
endpointsSpots.post("/", async (req, res) => {
  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    return res.status(400).json({ error: "Latitud no es un número" });
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    return res.status(400).json({ error: "Longitud no es un número" });
  }

  if (typeof req.body.direccion_aproximada !== "string" || req.body.direccion_aproximada.trim() == "") {
    return res.status(400).json({error: "Dirección aproximada debe ser un string y no puede estar vacio"});
  }

  if (typeof req.body.referencia !== "string" || req.body.referencia.trim() == "") {
    return res.status(400).json({error: "Referencia debe ser un string y no puede estar vacio"});
  }

  if (!estaDentroDelRadio(req.body.latitud, req.body.longitud)) {
    return res.status(400).json({ error: "El spot debe estar dentro de los 300 metros de la FIUBA" });
  }

  const created = await createSpot(
    req.body.latitud,
    req.body.longitud,
    req.body.direccion_aproximada,
    req.body.referencia,
  );

  if (!created) {
    return res.status(500).json({ error: "No se pudo crear el spot" });
  }

  res.status(201).json({
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    direccion_aproximada: req.body.direccion_aproximada,
    referencia: req.body.referencia,
  });
});


//READ
endpointsSpots.get("/", async (req, res) => {
  
  let dia_semana = new Date().getDay();
  if (dia_semana === 0)
      dia_semana = 7;
  const hora = new Date().toTimeString().slice(0, 8);

  const spots = await getAllSpots(dia_semana, hora);

  for (const spot of spots) {
    if (spot.restricciones_activas > 0)
        spot.estado = 'restringido';
    else if (spot.ultimo_estado === null)
        spot.estado = 'sin_informacion_reciente';
    else 
        spot.estado = spot.ultimo_estado;
  }

  res.json(spots);
});

endpointsSpots.get("/:id", async (req, res) => {
  let id = req.params.id;

  const spot = await getSpot(id);

  if (spot === undefined) {
    return res.status(404).json({ error: "Spot no encontrado" });
  }

  res.json(spot);
});


//UPDATE
endpointsSpots.put("/:id", async (req, res) => {
  let id = req.params.id;

  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    return res.status(400).json({ error: "Latitud no es un número" });
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    return res.status(400).json({ error: "Longitud no es un número" });
  }

  if (typeof req.body.direccion_aproximada !== "string" || req.body.direccion_aproximada.trim() == "") {
    return res.status(400).json({error: "Dirección aproximada debe ser un string y no puede estar vacio"});
  }

  if (typeof req.body.referencia !== "string" || req.body.referencia.trim() == "") {
    return res.status(400).json({error: "Referencia debe ser un string y no puede estar vacio"});
  }

  if (!estaDentroDelRadio(req.body.latitud, req.body.longitud)) {
    return res.status(400).json({ error: "El spot debe estar dentro de los 300 metros de la FIUBA" });
  }

  const spotActual = await getSpot(id);

  if (spotActual === undefined) {
    return res.status(404).json({ error: "Spot no encontrado" });
  }

  const seMovio =
    Number(spotActual.latitud) !== Number(req.body.latitud) ||
    Number(spotActual.longitud) !== Number(req.body.longitud);

  const updated = await updateSpot(
    id,
    req.body.latitud,
    req.body.longitud,
    req.body.direccion_aproximada,
    req.body.referencia
  );

  if (!updated) {
    return res.status(500).json({ error: "No se pudo actualizar el spot" });
  }

  if (seMovio) {
    await limpiarDatosDelSpot(id);
  }

  res.status(200).json({ mensaje: "Spot actualizado", se_movio: seMovio });
});


//DELETE
endpointsSpots.delete("/:id", async (req, res) => {
  let id = req.params.id;

  const spot = await getSpot(id);

  if (spot === undefined) {
    return res.status(404).json({ error: "Spot no encontrado" });
  }

  const eliminado = await deleteSpot(id);

  if (!eliminado) {
    return res.status(500).json({ error: "No se pudo eliminar el spot" });
  }

  res.json(spot);
});

