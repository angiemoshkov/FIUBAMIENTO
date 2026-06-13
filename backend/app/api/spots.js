import { Router } from "express";
import {
  createSpot,
  getAllSpots,
  getSpot,
  updateSpot,
  removeSpot,
} from "../db/spots.js";

export const endpointsSpots = Router();

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

// Actualización completa. Espera recibir todos los atributos del spot por body
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

  if (req.body.direccion_aproximada === undefined) {
    res.status(400).send("Direccion aproximada not set");
    return;
  }

  const updated = await updateSpot(
    id,
    req.body.latitud,
    req.body.longitud,
    req.body.direccion_aproximada,
    req.body.estado_actual ?? "ocupado",
    req.body.ultima_actualizacion ?? new Date(),
  );

  if (!updated) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

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

endpointsSpots.post("/", async (req, res) => {
  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    res.status(400).send("Latitud no es un número");
    return;
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    res.status(400).send("Longitud no es un número");
    return;
  }

  if (req.body.direccion_aproximada === undefined) {
    res.status(400).send("Direccion aproximada not set");
    return;
  }

  const estado_actual = req.body.estado_actual ?? "ocupado";
  const ultima_actualizacion = req.body.ultima_actualizacion ?? new Date();

  const created = await createSpot(
    req.body.latitud,
    req.body.longitud,
    req.body.direccion_aproximada,
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
    direccion_aproximada: req.body.direccion_aproximada,
    estado_actual: estado_actual,
    ultima_actualizacion: ultima_actualizacion,
  });
});
