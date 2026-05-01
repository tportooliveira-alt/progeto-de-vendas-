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
  { dir: 'claude-ads',          repo: 'https://github.com/Pranav-Karra-3301/claude-ads' },
  { dir: 'claude-seo',          repo: 'https://github.com/spences10/claude-seo' },
  { dir: 'ai-marketing-claude', repo: 'https://github.com/Pranav-Karra-3301/ai-marketing-claude' },
  { dir: 'caption-generator',   repo: 'https://github.com/jakeprins/social-media-caption-generator-claude' },
  { dir: 'linkedin-skills',     repo: 'https://github.com/jeromebreche/linkedin-skills' },
  { dir: 'awesome-claude-skills', repo: 'https://github.com/ComposioHQ/awesome-claude-skills' },
  { dir: 'marketmenow',         repo: 'https://github.com/marketmenow/marketmenow' }
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

// CLI only
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export { main, SKILLS };
