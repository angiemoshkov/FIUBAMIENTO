import { Router } from "express";
import {
  createRestriccion,
  getAllRestricciones,
  getRestriccion,
  updateRestriccion,
  deleteRestriccion,
} from "../db/restricciones.js";

export const endpointsRestricciones = Router();

endpointsRestricciones.post("/", async (req, res) => {
  try {
    const { spot_id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion } = req.body;

    if (!spot_id || isNaN(Number(spot_id))) {
      return res.status(400).json({ error: "El campo 'spot_id' es obligatorio y debe ser un número" });
    }

    if (tipo_restriccion === undefined || tipo_restriccion === null || tipo_restriccion.trim() === "" || tipo_restriccion.length > 100) {
      return res.status(400).json({ error: "El campo tipo_restriccion es obligatorio (máx 100 caracteres)" });
    }

    if (dia_semana === undefined || isNaN(Number(dia_semana))) {
      return res.status(400).json({ error: "Día de la semana es obligatorio y debe ser un número" });
    }

    if (!hora_inicio || !hora_fin) {
      return res.status(400).json({ error: "Los campos 'hora_inicio' y 'hora_fin' son obligatorios" });
    }

    const created = await createRestriccion(
      spot_id,
      tipo_restriccion,
      dia_semana,
      hora_inicio,
      hora_fin,
      descripcion
    );

    if (!created) {
      return res.status(500).json({ error: "No se pudo crear la restricción" });
    }

    return res.status(201).json({
      spot_id,
      tipo_restriccion,
      dia_semana,
      hora_inicio,
      hora_fin,
      descripcion,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor al crear la restricción" });
  }
});

endpointsRestricciones.get("/", async (req, res) => {
  try {
    const { spot_id } = req.query;

    if (!spot_id) {
      return res.status(400).json({ error: "Es necesario proveer un 'spot_id' en la URL (?spot_id=X)" });
    }

    const restricciones = await getAllRestricciones(spot_id);
    return res.json(restricciones);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor al obtener registros" });
  }
});

endpointsRestricciones.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const restriccion = await getRestriccion(id);

    if (!restriccion) {
      return res.status(404).json({ error: "Restricción no encontrada" });
    }

    return res.json(restriccion);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor al obtener la restricción" });
  }
});

endpointsRestricciones.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion } = req.body;

    if (!tipo_restriccion || tipo_restriccion.length > 100) {
      return res.status(400).json({ error: "El campo 'tipo_restriccion' es obligatorio (max 100 caracteres)" });
    }
    if (dia_semana === undefined || isNaN(Number(dia_semana))) {
      return res.status(400).json({ error: "El campo 'dia_semana' debe ser un número" });
    }

    const updated = await updateRestriccion(id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion);

    if (!updated) {
      return res.status(404).json({ error: "No se encontró la restricción para actualizar" });
    }

    return res.json({ mensaje: "Restricción actualizada con éxito" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor al actualizar" });
  }
});

endpointsRestricciones.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteRestriccion(id);

    if (!deleted) {
      return res.status(404).json({ error: "No se encontró la restricción para eliminar" });
    }

    return res.json({ mensaje: "Restricción eliminada con éxito" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor al eliminar" });
  }
});