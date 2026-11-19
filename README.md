# Comparador Pokémon

Cadenas de «¿es mayor?»: elegís una categoría (altura, peso o velocidad base), un Pokémon inicial
y vas validando el siguiente. Si no supera al actual (empate incluido), perdés. Las partidas se
guardan en el navegador y se pueden exportar/importar como JSON.

- `index.html` — la app (sin build).
- `data.js` — generado por `node scripts/build-data.mjs`; cada valor coincide en PokéAPI y Pokémon Showdown.
- `node scripts/fetch-portraits.mjs` — baja los retratos a `portraits/` (no están en el repo).

Retratos: [PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab), CC BY-NC 4.0.
Pokémon es marca de Nintendo / Game Freak / The Pokémon Company.
