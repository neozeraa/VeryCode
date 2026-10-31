import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const rootPath = path.resolve(path.dirname(__filename), '../..');
const CACHE_FILE = path.resolve(rootPath, 'config', 'all_system_commands.json');

export function scanAllSystemCommands() {
  const commandMap = {};

  // 1. Coleta todos os diretórios do PATH do sistema atual
  const paths = (process.env.PATH || '')
    .split(':')
    .filter(p => p && fs.existsSync(p));

  // Pastas adicionais comuns de Termux e Linux
  const extraPaths = [
    '/data/data/com.termux/files/usr/bin',
    '/bin',
    '/usr/bin',
    '/usr/local/bin',
    '/sbin',
    '/usr/sbin'
  ];

  for (const extra of extraPaths) {
    if (fs.existsSync(extra) && !paths.includes(extra)) {
      paths.push(extra);
    }
  }

  // 2. Indexa cada arquivo executável real
  for (const dir of paths) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!commandMap[file]) {
          commandMap[file] = {
            tipo: "binário/sistema",
            origem: dir,
            descricao: `Comando executável nativo do sistema (${file})`
          };
        }
      }
    } catch {}
  }

  // 3. Captura builtins do Bash usando compgen
  try {
    const builtins = execSync("bash -c 'compgen -b'", { encoding: 'utf-8' })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    for (const b of builtins) {
      commandMap[b] = {
        tipo: "builtin",
        origem: "bash_internal",
        descricao: `Comando interno embutido do Shell (${b})`
      };
    }
  } catch {}

  // 4. Integra descrições personalizadas existentes de bash_builtins_custom.json
  const customPath = path.resolve(rootPath, 'config', 'bash_builtins_custom.json');
  if (fs.existsSync(customPath)) {
    try {
      const customData = JSON.parse(fs.readFileSync(customPath, 'utf-8'));
      for (const [key, val] of Object.entries(customData)) {
        if (commandMap[key]) {
          commandMap[key].descricao = val.descricao || commandMap[key].descricao;
          commandMap[key].regra = val.regra_custom || '';
        } else {
          commandMap[key] = {
            tipo: "interno/custom",
            origem: "very_systems",
            descricao: val.descricao || key,
            regra: val.regra_custom || ''
          };
        }
      }
    } catch {}
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(commandMap, null, 2), 'utf-8');
  return commandMap;
}

export function getAllCommands() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {}
  }
  return scanAllSystemCommands();
}
