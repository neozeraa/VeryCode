import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const orange = chalk.hex('#FF6600').bold;
const orangeLight = chalk.hex('#FFA347');
const white = chalk.white.bold;
const gray = chalk.gray;

const __filename = fileURLToPath(import.meta.url);
const rootPath = path.resolve(path.dirname(__filename), '..');

const DB_PATH = path.resolve(rootPath, 'config', 'projects_db.json');
const PROJECTS_DIR = path.resolve(rootPath, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ projects: [] }, null, 2), 'utf-8');
    return { projects: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { projects: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveProject({ name, type = 'site', code, description = '', port = 3000 }) {
  const db = loadDB();
  const cleanName = name
    .replace(/^(chamado|chamada|nome|com o nome de|com o nome)\s+/i, '')
    .replace(/[,;:'"]/g, '')
    .trim();

  const slug = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const projectFolder = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(projectFolder)) fs.mkdirSync(projectFolder, { recursive: true });

  const fileName = type === 'site' ? 'index.html' : 'index.js';
  const filePath = path.join(projectFolder, fileName);
  fs.writeFileSync(filePath, code, 'utf-8');

  const now = new Date().toLocaleString('pt-BR');
  const existingIdx = db.projects.findIndex(p => p.slug === slug || p.name.toLowerCase() === cleanName.toLowerCase());

  const projectEntry = {
    id: existingIdx >= 0 ? db.projects[existingIdx].id : `proj_${Date.now()}`,
    name: cleanName,
    slug,
    type,
    folder: projectFolder,
    mainFile: filePath,
    port,
    description: description || cleanName,
    updatedAt: now,
    createdAt: existingIdx >= 0 ? db.projects[existingIdx].createdAt : now
  };

  if (existingIdx >= 0) {
    db.projects[existingIdx] = projectEntry;
  } else {
    db.projects.push(projectEntry);
  }

  saveDB(db);
  return projectEntry;
}

export function getProject(nameOrSlug) {
  const db = loadDB();
  const clean = nameOrSlug
    .replace(/^(chamado|chamada)\s+/i, '')
    .replace(/[,;:'"]/g, '')
    .toLowerCase()
    .trim();
  const slugTarget = clean.replace(/[^a-z0-9_-]/g, '_');

  return db.projects.find(p => 
    p.slug === slugTarget || 
    p.name.toLowerCase() === clean ||
    p.name.toLowerCase().includes(clean)
  ) || null;
}

export function listProjects() {
  const db = loadDB();
  if (db.projects.length === 0) {
    console.log(chalk.yellow('\n[BANCO DE DADOS] Nenhum projeto registado. Crie um site ou bot com a IA!\n'));
    return;
  }

  console.log('\n' + orange('==================================================================='));
  console.log(white('        VERY SYSTEMS  •  BANCO DE PROJETOS REGISTADOS            '));
  console.log(orange('==================================================================='));
  console.log(gray(' NOME DO PROJETO        TIPO     PORTA   ÚLTIMA MODIFICAÇÃO'));
  console.log(gray('───────────────────────────────────────────────────────────────────'));

  for (const p of db.projects) {
    const nome = white(p.name.padEnd(22, ' '));
    const tipo = orangeLight(p.type.padEnd(8, ' '));
    const porta = chalk.cyan(`:${p.port}`.padEnd(8, ' '));
    const data = gray(p.updatedAt);
    console.log(` ${nome} ${tipo} ${porta} ${data}`);
  }

  console.log(gray('───────────────────────────────────────────────────────────────────'));
  console.log(white(' Total: ') + orange(`${db.projects.length} projeto(s)`) + gray(' | Ligar: "ligar <nome>" | Storage: "mv <nome>" | Deletar: "rm <nome>"'));
  console.log(gray('───────────────────────────────────────────────────────────────────\n'));
}

export function moveProjectToStorage(nameOrSlug) {
  const proj = getProject(nameOrSlug);
  if (!proj) {
    console.log(chalk.red(`\nProjeto "${nameOrSlug}" não localizado no banco. Digite /ls para conferir.\n`));
    return false;
  }

  let storageBase = path.resolve(process.env.HOME || '', 'storage', 'shared', 'VeryCode');
  if (!fs.existsSync(path.resolve(process.env.HOME || '', 'storage', 'shared'))) {
    storageBase = path.resolve('/sdcard', 'VeryCode');
  }

  if (!fs.existsSync(storageBase)) {
    fs.mkdirSync(storageBase, { recursive: true });
  }

  const destFolder = path.join(storageBase, proj.slug);
  fs.cpSync(proj.folder, destFolder, { recursive: true });

  console.log(chalk.green('\n=================================================='));
  console.log(white(`✓ PROJETO "${proj.name}" TRANSFERIDO PARA O STORAGE!`));
  console.log(orange('=================================================='));
  console.log(chalk.white(' • Origem:  ') + gray(proj.folder));
  console.log(chalk.white(' • Destino: ') + chalk.cyan(destFolder));
  console.log(chalk.gray(' Acessível no gestor de ficheiros da memória do telemóvel.\n'));
  return true;
}

export function removeProject(nameOrSlug) {
  const proj = getProject(nameOrSlug);
  if (!proj) {
    console.log(chalk.red(`\nProjeto "${nameOrSlug}" não encontrado para remoção. Digite /ls para conferir.\n`));
    return false;
  }

  if (fs.existsSync(proj.folder)) {
    fs.rmSync(proj.folder, { recursive: true, force: true });
  }

  const db = loadDB();
  db.projects = db.projects.filter(p => p.id !== proj.id && p.slug !== proj.slug);
  saveDB(db);

  console.log(chalk.red('\n=================================================='));
  console.log(white(`✓ PROJETO "${proj.name}" REMOVIDO COM SUCESSO!`));
  console.log(orange('=================================================='));
  console.log(chalk.gray(`Ficheiros e registos do projeto apagados com sucesso.\n`));
  return true;
}
