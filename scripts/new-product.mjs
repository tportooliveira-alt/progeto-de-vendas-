#!/usr/bin/env node
/**
 * new-product.mjs — cadastra um produto novo
 * Uso: node scripts/new-product.mjs
 *
 * Faz: pergunta tipo + slug + nome + preco -> herda preset -> salva product.yaml
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const PRESETS = path.join(ROOT, 'products', '_presets');
const SCHEMA = path.join(ROOT, 'products', '_schema.yaml');

const TIPOS = [
  'ebook', 'planilha', 'audiobook', 'curso', 'mentoria',
  'comunidade', 'evento', 'saas', 'microsaas', 'fisico',
  'bundle', 'freemium', 'afiliacao', 'b2b'
];

function deepMerge(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over ?? base;
  if (typeof base !== 'object' || typeof over !== 'object' || !base || !over) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const rl = readline.createInterface({ input, output });
  const ask = async (q, dflt) => {
    const r = await rl.question(`${q}${dflt ? ` [${dflt}]` : ''}: `);
    return r.trim() || dflt || '';
  };

  console.log('\n📦 Novo produto — agents-factory\n');

  const tipo = (await ask(`Tipo (${TIPOS.join('|')})`, 'ebook')).toLowerCase();
  if (!TIPOS.includes(tipo)) {
    console.error(`❌ Tipo invalido. Use um de: ${TIPOS.join(', ')}`);
    process.exit(1);
  }

  const nome = await ask('Nome comercial');
  if (!nome) { console.error('❌ Nome obrigatorio'); process.exit(1); }

  const slug = (await ask('Slug (kebab-case)', slugify(nome))).trim();
  const preco = parseFloat(await ask('Preco (BRL)', '0')) || 0;
  const promessa = await ask('Promessa em 1 frase', '');
  const dor = await ask('Dor principal do avatar', '');
  const plataforma = await ask('Plataforma de venda', 'hotmart');

  const dest = path.join(ROOT, 'products', slug);
  if (fs.existsSync(dest)) {
    console.error(`❌ Ja existe: ${dest}`);
    process.exit(1);
  }

  const schema = YAML.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const presetPath = path.join(PRESETS, `${tipo}.yaml`);
  const preset = fs.existsSync(presetPath) ? YAML.parse(fs.readFileSync(presetPath, 'utf8')) : {};
  const merged = deepMerge(schema, preset);

  merged.slug = slug;
  merged.nome = nome;
  merged.tipo = tipo;
  merged.preco = preco;
  merged.plataforma_venda = plataforma;
  merged.oferta = merged.oferta || {};
  if (promessa) merged.oferta.promessa = promessa;
  if (dor) merged.oferta.dor = dor;

  fs.mkdirSync(dest, { recursive: true });
  fs.mkdirSync(path.join(dest, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dest, 'product.yaml'), YAML.stringify(merged), 'utf8');
  fs.writeFileSync(path.join(dest, 'assets', '.gitkeep'), '');

  console.log(`\n✅ Criado: products/${slug}/product.yaml`);
  console.log(`   Edite os campos restantes (avatar_cliente, brand, canais, etc.)`);
  rl.close();
}

main().catch(err => { console.error(err); process.exit(1); });
