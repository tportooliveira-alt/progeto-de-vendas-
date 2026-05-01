/**
 * lib/products/loader.mjs
 * Carrega produtos cadastrados em products/<slug>/product.yaml
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', '..');
const PRODUCTS_DIR = path.join(ROOT, 'products');

export function listProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) return [];
  return fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);
}

export function loadProduct(slug) {
  const file = path.join(PRODUCTS_DIR, slug, 'product.yaml');
  if (!fs.existsSync(file)) throw new Error(`Produto nao encontrado: ${slug}`);
  return YAML.parse(fs.readFileSync(file, 'utf8'));
}

export function loadAllProducts() {
  return listProducts().map(loadProduct);
}
