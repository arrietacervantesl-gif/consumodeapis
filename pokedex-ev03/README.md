# Pokédex – GA2-220501096-AA2-EV03 (Consumo de API de terceros)

API usada: [PokeAPI](https://pokeapi.co/)
Backend: Node.js + Express · Frontend: HTML + CSS + JavaScript

## Ejecutar el backend (con entorno aislado)
```bash
cd backend
npm install        # instala dependencias SOLO dentro de backend/node_modules (equivale al "entorno virtual" de Node)
npm start          # http://localhost:3000
```
Pruebas: `http://localhost:3000/api/pokemon` y `http://localhost:3000/api/pokemon/pikachu`

## Ejecutar el frontend
Abre `frontend/index.html` con Live Server (VS Code) o ejecuta `npx serve frontend`.
En `frontend/config.js` está la URL del backend. Si la dejas vacía ("") consulta la PokeAPI directamente.

## Desplegar en GitHub Pages
1. Sube todo el repositorio a GitHub.
2. Settings → Pages → Branch `main`, carpeta `/frontend` (o mueve el contenido de frontend a `/docs` y elige `/docs`).
3. Para Pages deja `API_BASE: ""` (Pages solo aloja sitios estáticos, no puede ejecutar Node).
