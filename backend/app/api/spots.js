import { Router } from "express";
import {
  createPokemon,
  getAllPokemons,
  getPokemon,
  removePokemon,
  updatePokemon,
} from "../db/spots.js";
import { getTipoByName } from "../db/restricciones.js";

export const endpointsPokemons = Router();

endpointsPokemons.get("/", async (req, res) => {
  const pokemons = await getAllPokemons();
  res.json(pokemons);
});

endpointsPokemons.get("/:indice", async (req, res) => {
  let indice = req.params.indice;
  // Chequear que indice es un número.

  const pokemon = await getPokemon(indice);

  if (pokemon === undefined) {
    res.sendStatus(404);
    return;
  }

  res.json(pokemon);
});

// Actualización completa. Espera recibir todos los atributos del pokemon por body
endpointsPokemons.put("/:indice", async (req, res) => {
  let indice = req.params.indice;

  if (
    req.body.evolucion === undefined ||
    !Number.isInteger(req.body.evolucion)
  ) {
    res.status(400).send("Evolucion not set");
    return;
  }

  // Agregar más validaciones y validaciones para el resto de campos

  const tipo = await getTipoByName(req.body.tipo);

  if (tipo === undefined) {
    res.sendStatus(404);
    return;
  }

  const updated = await updatePokemon(
    indice,
    req.body.nombre,
    req.body.evolucion,
    tipo.id,
    req.body.rareza,
  );

  if (!updated) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// Actualización parcial. Solo actualiza los atributos que llegan por body
endpointsPokemons.patch("/:indice", async (req, res) => {
  let indice = req.params.indice;

  if (
    req.body.evolucion !== undefined &&
    !Number.isInteger(req.body.evolucion)
  ) {
    res.status(400).send("Evolucion no es un número");
    return;
  }

  let pokemon = await getPokemon(indice);

  if (pokemon === undefined) {
    res.sendStatus(404);
    return;
  }

  if (req.body.evolucion !== undefined) {
    pokemon.evolucion = parseInt(req.body.evolucion);
  }

  let tipo;
  if (req.body.tipo !== undefined) {
    tipo = await getTipoByName(req.body.tipo);
  } else {
    // SUPER ineficiente, estamos consultando un valor que ya deberíamos tener.
    tipo = await getTipoByName(pokemon.tipo);
  }

  if (tipo === undefined) {
    res.sendStatus(404);
    return;
  }

  pokemon.tipo = tipo.id;

  const updated = await updatePokemon(
    indice,
    pokemon.nombre,
    pokemon.evolucion,
    pokemon.tipo,
    pokemon.rareza,
  );

  if (!updated) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

endpointsPokemons.delete("/:indice", async (req, res) => {
  let indice = req.params.indice;

  const pokemon = await getPokemon(indice);

  if (pokemon === undefined) {
    res.sendStatus(404);
    return;
  }

  const eliminado = await removePokemon(indice);

  if (!eliminado) {
    res.sendStatus(500);
    return;
  }

  res.json(pokemon);
});

endpointsPokemons.post("/", async (req, res) => {
  if (
    req.body.evolucion === undefined ||
    !Number.isInteger(req.body.evolucion)
  ) {
    res.status(400).send("Evolucion not set");
    return;
  }

  const tipo = await getTipoByName(req.body.tipo);

  if (tipo === undefined) {
    res.sendStatus(404);
    return;
  }

  const created = await createPokemon(
    req.body.nombre,
    req.body.evolucion,
    tipo.id,
    req.body.rareza,
  );

  if (!created) {
    res.sendStatus(500);
    return;
  }

  res.status(201).json({
    nombre: req.body.nombre,
    evolucion: req.body.evolucion,
    tipo: req.body.tipo,
    rareza: req.body.rareza,
  });
});
