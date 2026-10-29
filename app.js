// Frontend: consume el backend (si API_BASE está configurado) o la PokeAPI directamente.
const BACKEND = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "";
const POKEAPI = "https://pokeapi.co/api/v2";
const LIMIT = 12;
let offset = 0;
let total = 0;

const $ = (id) => document.getElementById(id);
const grid = $("grid"), statusEl = $("status");

// ---------- Acceso a datos ----------
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

async function fetchJSON(url) {
  console.log("GET", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status === 404 ? "Pokémon no encontrado" : "Error " + res.status);
  return res.json();
}

async function getList(off) {
  if (BACKEND) return fetchJSON(`${BACKEND}/api/pokemon?limit=${LIMIT}&offset=${off}`);
  const list = await fetchJSON(`${POKEAPI}/pokemon?limit=${LIMIT}&offset=${off}`);
  const details = await Promise.all(list.results.map((r) => fetchJSON(r.url)));
  return { count: list.count, results: details.map(simplify) };
}

async function getOne(q) {
  const id = encodeURIComponent(q.trim().toLowerCase());
  if (BACKEND) return fetchJSON(`${BACKEND}/api/pokemon/${id}`);
  return simplify(await fetchJSON(`${POKEAPI}/pokemon/${id}`));
}

// ---------- Renderizado ----------
function badges(types) {
  return types.map((t) => `<span class="badge">${t}</span>`).join("");
}

function renderCards(items) {
  grid.innerHTML = "";
  items.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="id">#${String(p.id).padStart(3, "0")}</div>
      <h3>${p.name}</h3><div>${badges(p.types)}</div>`;
    card.addEventListener("click", () => openModal(p));
    grid.appendChild(card);
  });
}

function openModal(p) {
  const maxStat = 160;
  $("modalBody").innerHTML = `
    <div style="text-align:center">
      <img src="${p.image}" alt="${p.name}" width="160">
      <h2 style="text-transform:capitalize;margin:.2rem">${p.name} <small class="id">#${p.id}</small></h2>
      <div>${badges(p.types)}</div>
      <p>Altura: ${p.height} m · Peso: ${p.weight} kg</p>
      <p>Habilidades: ${p.abilities.join(", ")}</p>
    </div>
    ${p.stats.map((s) => `<div class="stat"><span>${s.name}</span><span>${s.value}</span>
      <div class="bar"><div style="width:${Math.min(100, (s.value / maxStat) * 100)}%"></div></div></div>`).join("")}`;
  $("modal").showModal();
}

function setStatus(msg) { statusEl.textContent = msg; }

// ---------- Acciones ----------
async function loadPage() {
  setStatus("Cargando...");
  try {
    const data = await getList(offset);
    total = data.count;
    renderCards(data.results);
    $("pageInfo").textContent = `Página ${offset / LIMIT + 1} de ${Math.ceil(total / LIMIT)}`;
    $("prevBtn").disabled = offset === 0;
    $("nextBtn").disabled = offset + LIMIT >= total;
    $("pager").style.display = "flex";
    setStatus("");
  } catch (e) {
    console.error(e);
    setStatus("No se pudo cargar la lista: " + e.message);
  }
}

async function search() {
  const q = $("searchInput").value;
  if (!q.trim()) return setStatus("Escribe un nombre o número.");
  setStatus("Buscando...");
  try {
    const p = await getOne(q);
    renderCards([p]);
    $("pager").style.display = "none";
    setStatus("");
  } catch (e) {
    console.error(e);
    grid.innerHTML = "";
    setStatus(e.message);
  }
}

$("searchBtn").addEventListener("click", search);
$("searchInput").addEventListener("keydown", (e) => e.key === "Enter" && search());
$("resetBtn").addEventListener("click", () => { $("searchInput").value = ""; offset = 0; loadPage(); });
$("prevBtn").addEventListener("click", () => { offset -= LIMIT; loadPage(); });
$("nextBtn").addEventListener("click", () => { offset += LIMIT; loadPage(); });
$("closeBtn").addEventListener("click", () => $("modal").close());

loadPage();
