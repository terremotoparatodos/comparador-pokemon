// Genera data.js: altura, peso y velocidad base de cada especie con retrato PMD.
//
// Cada valor está verificado en DOS fuentes independientes; si no coinciden exactamente,
// ese dato queda fuera (la especie no aparece en esa categoría).
//
//   Altura y peso → .cache/altura-peso.json (copiado de mayor-o-menor-pokemon, ya cruzado
//                   PokéAPI × Showdown por su propio build-data).
//   Velocidad     → Fuente A · PokéAPI pokemon_stats.csv (stat_id 6, forma por defecto)
//                   Fuente B · Showdown pokedex.json (baseStats.spe, forma base)
//
//   node scripts/build-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = (f) => readFileSync(join(root, '.cache', f), 'utf8');

function parseCsv(text) {
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const cols = head.split(',');
  return rows.map((line) => Object.fromEntries(line.split(',').map((v, i) => [cols[i], v])));
}

const species = JSON.parse(cache('altura-peso.json'));
const pokemon = parseCsv(cache('pokemon.csv'));
const stats = parseCsv(cache('pokemon_stats.csv'));
const showdown = JSON.parse(cache('showdown-pokedex.json'));

const defaultId = new Map();
for (const p of pokemon) if (p.is_default === '1') defaultId.set(Number(p.species_id), Number(p.id));
const speedA = new Map();
for (const s of stats) if (s.stat_id === '6') speedA.set(Number(s.pokemon_id), Number(s.base_stat));
const sdBase = new Map();
for (const e of Object.values(showdown)) if (e.num > 0 && !e.forme && !sdBase.has(e.num)) sdBase.set(e.num, e);

const excluded = [];
const out = species.map((s) => {
  const a = speedA.get(defaultId.get(s.dex));
  const b = sdBase.get(s.dex)?.baseStats?.spe;
  let spe = null;
  if (a == null || b == null) excluded.push(`${s.slug}: velocidad sin dato (A ${a} · B ${b})`);
  else if (a !== b) excluded.push(`${s.slug}: velocidad distinta (A ${a} · B ${b})`);
  else spe = a;
  return { d: s.dex, n: s.name, h: s.height, w: s.weight, s: spe };
});

const header = `// Generado por scripts/build-data.mjs — no editar a mano.\n// d = n.º Pokédex · n = nombre · h = altura (m) · w = peso (kg) · s = velocidad base\n`;
const body = out.map((o) => JSON.stringify(o)).join(',\n');
writeFileSync(join(root, 'data.js'), `${header}window.POKEDATA = [\n${body}\n];\n`);
writeFileSync(join(root, '.cache/excluidos-velocidad.txt'), excluded.join('\n'));
console.log(`Listo: ${out.length} especies · velocidad verificada en ${out.filter((o) => o.s != null).length} · excluidas de velocidad: ${excluded.length}`);
if (excluded.length) console.log(excluded.join('\n'));
