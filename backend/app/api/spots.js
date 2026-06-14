import { Router } from "express";
import {
  createSpot,
  getAllSpots,
  getSpot,
  updateSpot,
  deleteSpot,
} from "../db/spots.js";

export const endpointsSpots = Router();

//---CRUD completo, respetando el orden de las siglas"---//

//CREATE
endpointsSpots.post("/", async (req, res) => {
  if (req.body.latitud === undefined || isNaN(Number(req.body.latitud))) {
    return res.status(400).json({ error: "Latitud no es un número" });
  }

  if (req.body.longitud === undefined || isNaN(Number(req.body.longitud))) {
    return res.status(400).json({ error: "Longitud no es un número" });
  }

  if (req.body.direccion_aproximada === undefined) {
    return res.status(400).json({ error: "Direccion aproximada not set" });
  }

  const created = await createSpot(
    req.body.latitud,
    req.body.longitud,
    req.body.direccion_aproximada,
    req.body.estado_actual ?? "ocupado",
    req.body.ultima_actualizacion ?? new Date()
  );

  if (!created) {
    return res.status(500).json({ error: "No se pudo crear el spot" });
  }

  res.status(201).json({
    latitud: req.body.latitud,
    longitud: req.body.longitud,
    direccion_aproximada: req.body.direccion_aproximada,
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

  if (req.body.direccion_aproximada === undefined) {
    return res.status(400).json({ error: "Direccion aproximada not set" });
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
    return res.status(500).json({ error: "No se pudo actualizar el spot" });
  }

  res.status(200).json({ mensaje: "Spot actualizado" });
});


//DELETE
endpointsSpots.delete("/:id", async (req, res) => {
  let id = req.params.id;

  const spot = await getSpot(id);

  if (spot === undefined) {
    return res.status(404).json({ error: "Spot no encontrado" });
  }

  const eliminado = await removeSpot(id);

  if (!eliminado) {
    return res.status(500).json({ error: "No se pudo eliminar el spot" });
  }

  res.json(spot);
});

