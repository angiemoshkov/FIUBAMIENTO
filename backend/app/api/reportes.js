import { Router } from "express";
import { }

export const endpointsTipos = Router();

endpointsTipos.get("/", async (req, res) => {
  const tipos = await getAllTipos();
  res.json(tipos);
});
const express = require('express');
const router = express.Router();
const reportesDb = require('../db/reportes'); // Importa las queries del archivo de arriba

// GET: Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const reportes = await reportesDb.getAll();
    res.status(200).json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes', detalle: error.message });
  }
});

// POST: Crear un reporte
router.post('/', async (req, res) => {
  try {
    const nuevoReporte = await reportesDb.create(req.body);
    res.status(201).json(nuevoReporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear reporte', detalle: error.message });
  }
});

// PUT: Actualizar un reporte por ID
router.put('/:id', async (req, res) => {
  try {
    const reporteActualizado = await reportesDb.update(req.params.id, req.body);
    if (!reporteActualizado) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.status(200).json(reporteActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar reporte', detalle: error.message });
  }
});

// DELETE: Eliminar un reporte por ID
router.delete('/:id', async (req, res) => {
  try {
    const reporteEliminado = await reportesDb.delete(req.params.id);
    if (!reporteEliminado) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.status(200).json({ message: `Reporte con ID ${req.params.id} eliminado` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar reporte', detalle: error.message });
  }
});

module.exports = router;