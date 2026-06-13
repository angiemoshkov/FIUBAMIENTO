import { Router } from "express";
import { getAllTipos } from "../../../backend_docker/app/db/tipos.js";

export const endpointsTipos = Router();

endpointsTipos.get("/", async (req, res) => {
  const tipos = await getAllTipos();
  res.json(tipos);
});
