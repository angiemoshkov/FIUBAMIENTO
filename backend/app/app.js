import express from "express";
import { endpointsPokemons } from "./api/pokemons.js";
import { endpointsTipos } from "./api/tipos.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/v1/pokemons", endpointsPokemons);
app.use("/api/v1/tipos", endpointsTipos);

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => console.log(`Escuchando en puerto ${port}`));
