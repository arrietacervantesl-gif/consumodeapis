// Backend: Express actúa como intermediario (proxy) entre el frontend y la PokeAPI.
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const POKEAPI = "https://pokeapi.co/api/v2";

app.use(cors()); // permite que el frontend (otro dominio) llame a este servidor

// Caché simple en memoria para no repetir peticiones
const cache = new Map();

async function getJSON(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error("Pokémon no encontrado");
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  cache.set(url, data);
  return data;
}

// Deja solo los datos que necesita el frontend
function simplify(p) {
  return {
    id: p.id,
    name: p.name,
    image: p.sprites.other["official-artwork"].front_default || p.sprites.front_default,
    types: p.types.map((t) => t.type.name),
    height: p.height / 10,
    weight: p.weight / 10,
    abilities: p.abilities.map((a) => a.ability.name),
    stats: p.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

// GET /api/pokemon?limit=12&offset=0  -> lista paginada
app.get("/api/pokemon", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const list = await getJSON(`${POKEAPI}/pokemon?limit=${limit}&offset=${offset}`);
    const details = await Promise.all(list.results.map((r) => getJSON(r.url)));
    console.log(`Lista solicitada: offset=${offset}, limit=${limit}`);
    res.json({ count: list.count, results: details.map(simplify) });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// GET /api/pokemon/:nameOrId -> un Pokémon
app.get("/api/pokemon/:id", async (req, res) => {
  try {
    const id = encodeURIComponent(req.params.id.toLowerCase());
    const data = await getJSON(`${POKEAPI}/pokemon/${id}`);
    res.json(simplify(data));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/", (_req, res) => res.json({ ok: true, endpoints: ["/api/pokemon", "/api/pokemon/:nameOrId"] }));

app.listen(PORT, () => console.log(`Backend listo en http://localhost:${PORT}`));
