import { Router } from "express";
import {
  createSpot,
  getAllSpots,
  getSpot,
  updateSpot,
  removeSpot,
} from "../db/spots.js";

export const endpointsSpots = Router();

const FIUBA = { lat: -34.6178, lon: -58.3685 };  // verificá vos las coords exactas
const RADIO_MAX = 300; // metros

function distanciaEnMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
  

//CREATE
endpointsSpots.post("/", async (req, res) => {
  const { lat, lng, descripcion } = req.body;
  const distancia = distanciaEnMetros(FIUBA.lat, FIUBA.lon, lat, lng);

  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    res.status(400).send("Latitud no es un número");
    return;
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    res.status(400).send("Longitud no es un número");
    return;
  }

  if (req.body.ubicacion === undefined) {
    res.status(400).send("Ubicacion not set");
    return;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Faltan coordenadas válidas' });
  }

  if (distancia > RADIO_MAX) {
    return res.status(400).json({ error: 'El spot está fuera del radio permitido (300m de FIUBA)' });
  }

  try {
    const nuevoSpot = await createSpot(lat, lng, descripcion);
    return res.status(201).json(nuevoSpot);
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear el spot' });
  }
});

  const estado_actual = req.body.estado_actual ?? "ocupado";
  const ultima_actualizacion = req.body.ultima_actualizacion ?? new Date();

  const created = await createSpot(
    req.body.latitud,
    req.body.longitud,
    req.body.ubicacion,
    estado_actual,
    ultima_actualizacion,
  );

  if (!created) {
    res.sendStatus(500);
    return;
  }

  res.status(201).json({
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    ubicacion: req.body.ubicacion,
    estado_actual: estado_actual,
    ultima_actualizacion: ultima_actualizacion,
  });
});


//READ
endpointsSpots.get("/", async (req, res) => {
  const spots = await getAllSpots();
  res.json(spots);
});

endpointsSpots.get("/:id", async (req, res) => {
  let id = req.params.id;

  const spot = await getSpot(id);

  if (spot === undefined) {
    res.sendStatus(404);
    return;
  }

  res.json(spot);
});


//UPDATE
endpointsSpots.put("/:id", async (req, res) => {
  let id = req.params.id;

  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    res.status(400).send("Latitud no es un número");
    return;
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    res.status(400).send("Longitud no es un número");
    return;
  }

  if (req.body.ubicacion === undefined) {
    res.status(400).send("Ubicacion not set");
    return;
  }

  const updated = await updateSpot(
    id,
    req.body.latitud,
    req.body.longitud,
    req.body.ubicacion,
    req.body.estado_actual ?? "ocupado",
    req.body.ultima_actualizacion ?? new Date(),
  );

  if (!updated) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});


//DELETE
endpointsSpots.delete("/:id", async (req, res) => {
  let id = req.params.id;

  const spot = await getSpot(id);

  if (spot === undefined) {
    res.sendStatus(404);
    return;
  }

  const eliminado = await removeSpot(id);

  if (!eliminado) {
    res.sendStatus(500);
    return;
  }

  res.json(spot);
});

