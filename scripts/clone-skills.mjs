#!/usr/bin/env node
/**
 * scripts/clone-skills.mjs
 * Clona skills referencia do GitHub em skills/_vendor/
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const VENDOR = path.join(ROOT, 'skills', '_vendor');

const SKILLS = [
  // Curadoria de base confiavel para skills, evals e frameworks de agentes.
  { dir: 'awesome-mcp-servers', repo: 'https://github.com/punkpeye/awesome-mcp-servers' },
  { dir: 'awesome-agent-skills', repo: 'https://github.com/heilcheng/awesome-agent-skills' },
  { dir: 'awesome-claude-code', repo: 'https://github.com/hesreallyhim/awesome-claude-code' },
  { dir: 'openai-evals', repo: 'https://github.com/openai/evals' },
  { dir: 'microsoft-autogen', repo: 'https://github.com/microsoft/autogen' },
  { dir: 'langchain', repo: 'https://github.com/langchain-ai/langchain' },
  { dir: 'langsmith-sdk', repo: 'https://github.com/langchain-ai/langsmith-sdk' },
  { dir: 'litellm', repo: 'https://github.com/BerriAI/litellm' }
];

fs.mkdirSync(VENDOR, { recursive: true });

function main() {
  let ok = 0, fail = 0;
  for (const s of SKILLS) {
    const target = path.join(VENDOR, s.dir);
    if (fs.existsSync(target)) {
      console.log(`✔ ${s.dir} já existe — pulando`);
      ok++;
      continue;
    }
    try {
      console.log(`⬇ Clonando ${s.dir}...`);
      execSync(`git clone --depth 1 ${s.repo} "${target}"`, { stdio: 'inherit' });
      fs.rmSync(path.join(target, '.git'), { recursive: true, force: true });
      ok++;
    } catch (e) {
      console.error(`✗ Falhou ${s.dir} (${s.repo})`);
      fail++;
    }
  }
  console.log(`\n📊 ${ok}/${SKILLS.length} ok, ${fail} falharam`);
  console.log(`📁 ${VENDOR}`);
}

// CLI only (compatível com npm/node no Windows)
const invokedAsScript =
  !!process.argv[1] &&
  (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
   process.argv[1].replace(/\\/g, '/').endsWith('/scripts/clone-skills.mjs'));

if (invokedAsScript) {
  main();
}

export { main, SKILLS };
