import { Router } from "express";
import { getReportesBySpot, getAllReportes, getReporteById, createReporte, updateReporte, deleteReporte } from "../db/reportes.js";

export const endpointsReportes = Router();

endpointsReportes.get("/", async (req, res) => {
  const { spot_id } = req.query;

  if (spot_id) {
    const reportes = await getReportesBySpot(spot_id);
    return res.json(reportes);
  }

  let dia_semana = new Date().getDay();
  if (dia_semana === 0)
      dia_semana = 7;
  const hora = new Date().toTimeString().slice(0, 8);

  const reportes = await getAllReportes(dia_semana, hora);
  
  for (const reporte of reportes) {
    if (reporte.restricciones_activas > 0)
      reporte.estado_actual = 'restringido';
    else if (!reporte.vigente)
      reporte.estado_actual = 'sin_informacion_reciente';
    else
      reporte.estado_actual = reporte.estado_reportado;
  }

  res.json(reportes);
});


endpointsReportes.get("/:id", async (req, res) => {
  const id = req.params.id;

  const reporte = await getReporteById(id);
  if (!reporte) {
    return res.status(404).json({ error: "Reporte no encontrado" });
  }
  res.json(reporte);
});


endpointsReportes.post("/", async (req, res) => {
  const { spot_id, estado_reportado } = req.body;

  if (!spot_id || !estado_reportado) {
    return res.status(400).json({ error: "spot_id y estado_reportado son obligatorios" });
  }

  const estados_validos = ["libre", "ocupado"];
  if (!estados_validos.includes(estado_reportado)) {
    return res.status(400).json({ error: "estado_reportado debe ser libre u ocupado" });
  }

  const reporte = await createReporte(spot_id, estado_reportado);
  res.status(201).json(reporte);
});


endpointsReportes.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { estado_reportado } = req.body;

  if (!estado_reportado) {
    return res.status(400).json({ error: "estado_reportado es obligatorio" });
  }

  const estados_validos = ["libre", "ocupado"];
  if (!estados_validos.includes(estado_reportado)) {
    return res.status(400).json({ error: "estado_reportado debe ser libre u ocupado"});
  }

  const reporte = await updateReporte(id, estado_reportado);
  if (!reporte) {
    return res.status(404).json({ error: "Reporte no encontrado" });
  }
  res.json(reporte);
});


endpointsReportes.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const eliminado = await deleteReporte(id);
  if (!eliminado) {
    return res.status(404).json({ error: "Reporte no encontrado, por lo que no se pudo eliminar" });
  }
  res.json({ mensaje: "Reporte eliminado" });
});
