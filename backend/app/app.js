import express from "express";
import { endpointsSpots } from "./api/spots.js";
import { endpointsReportes } from "./api/reportes.js";
import { endpointsRestricciones } from "./api/restricciones.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/v1/spots", endpointsSpots);
app.use("/api/v1/reportes", endpointsReportes);
app.use("/api/v1/restricciones", endpointsRestricciones);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => console.log(`Escuchando en puerto ${port}`));