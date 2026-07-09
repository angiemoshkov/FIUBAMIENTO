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

  if (typeof req.body.direccion_aproximada !== "string" || req.body.direccion_aproximada.trim() == "") {
    return res.status(400).json({error: "Dirección aproximada debe ser un string y no puede estar vacio"});
  }

  if (typeof req.body.referencia !== "string" || req.body.referencia.trim() == "") {
    return res.status(400).json({error: "Referencia debe ser un string y no puede estar vacio"});
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
    else if (spot.estado_reportado === null)
        spot.estado = 'sin_informacion_reciente';
    else 
        spot.estado = spot.estado_reportado;
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

  res.status(200).json({ mensaje: "Spot actualizado" });
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

