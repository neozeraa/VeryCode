#!/usr/bin/env node

import readline from 'node:readline';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

import { startAIMode } from './app/ai_core/01_chat_engine.js';
import { getAllCommands } from './app/src/universal_scanner.js';
import { routeUserAction } from './app/src/action_router.js';

const orange = chalk.hex('#FF6600');
const orangeBold = chalk.hex('#FF6600').bold;
const white = chalk.white;
const whiteBold = chalk.white.bold;
const gray = chalk.gray;

const __filename = fileURLToPath(import.meta.url);
const basePath = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log(chalk.red('\n[VERY SYSTEMS] Erro: GEMINI_API_KEY não definida.'));
  console.log(chalk.yellow('Execute: export GEMINI_API_KEY="sua_chave_aqui"\n'));
  process.exit(1);
}

const allCommandsMap = getAllCommands();
const totalCmds = Object.keys(allCommandsMap).length;

// Função abrangente com dezenas de variações para ligar o Modo IA
function isActivationAIMode(input) {
  const clean = input.toLowerCase().trim().replace(/[?!.,]/g, '');

  // Comandos diretos
  const directCommands = ['ia', 'ai', '/ia', '/ai', 'chat', '/chat', 'conversa', 'modo ia', 'modo ai'];
  if (directCommands.includes(clean)) return true;

  // Padrões e variações naturais de fala
  const regexVariacoes = /^(quero\s+)?(abrir|ligar|iniciar|ativar|chamar|acessar|entrar\s+no|trocar\s+para\s+o)\s+(modo\s+)?(ia|ai|chat|conversa|inteligencia\s+artificial)/i;
  const regexFalar = /^(quero\s+)?(falar|conversar|bater\s+papo|tirar\s+duvidas?)\s+(com\s+(a\s+|o\s+)?)?(voc[eê]|vc|ia|ai|chat)/i;

  return regexVariacoes.test(clean) || regexFalar.test(clean);
}

let greetingsData = { exact_matches: {}, keywords: [], quick_replies: [] };
try {
  const gPath = path.resolve(basePath, 'config', 'greetings.json');
  if (fs.existsSync(gPath)) {
    greetingsData = JSON.parse(fs.readFileSync(gPath, 'utf-8'));
  }
} catch {}

function checkInstantGreeting(text) {
  const clean = text.toLowerCase().trim().replace(/[?!.,]/g, '');
  if (greetingsData.exact_matches[clean]) return greetingsData.exact_matches[clean];
  for (const kw of greetingsData.keywords) {
    if (clean === kw || clean.startsWith(kw + ' ') || clean.endsWith(' ' + kw)) {
      const replies = greetingsData.quick_replies;
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return null;
}

const SYSTEM_INSTRUCTION = `
Você é o VeryCode Autonomous CLI Agent & Universal Linux Engine da VERY SYSTEMS.
Sua missão: Converter a instrução do usuário em comandos Bash eficientes e diretos para o sistema.
Retorne ESTRITAMENTE o comando bash executável puro sem markdown.
`.trim();

async function getBashCommands(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.1 }
    })
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `echo "Comando não reconhecido"`;
}

function runCommandStream(command) {
  return new Promise((resolve) => {
    console.log(`${orangeBold('verycode@ia~$')} ${orange(command)}\n`);
    const child = spawn(command, { shell: true, stdio: 'inherit' });
    child.on('close', (code) => {
      console.log(chalk.gray(`\n[Processo finalizado com status ${code}]\n`));
      resolve();
    });
    child.on('error', (err) => {
      console.log(chalk.red(`\n[Erro: ${err.message}]\n`));
      resolve();
    });
  });
}

function printBanner() {
  console.clear();
  const banner = `
${orangeBold('  __      __  ______   _____   __     __   _____   ____   _____   ______ ')}
${orangeBold('  \\ \\    / / |  ____| |  __ \\  \\ \\   / /  / ____| / __ \\ |  __ \\ |  ____|')}
${whiteBold('   \\ \\  / /  | |__    | |__) |  \\ \\_/ /  | |     | |  | || |  | || |__   ')}
${whiteBold('    \\ \\/ /   |  __|   |  _  /    \\   /   | |     | |  | || |  | ||  __|  ')}
${orangeBold('     \\  /    | |____  | | \\ \\     | |    | |____ | |__| || |__| || |____ ')}
${orangeBold('      \\/     |______| |_|  \\_\\    |_|     \\_____| \\____/ |_____/ |______|')}
`;
  console.log(banner);
  console.log(whiteBold('                     S Y S T E M S   C L I                        '));
  console.log(orange('                 Inteligência de Terminal Autônoma                '));
  console.log(chalk.gray('──────────────────────────────────────────────────────────────────'));
  console.log(white(' • Comandos do Sistema: ') + orangeBold(`${totalCmds} comandos indexados`));
  console.log(white(' • Ações Rápidas: ') + chalk.green('"ia"') + white(' • ') + chalk.cyan('"/help"') + white(' • ') + chalk.yellow('"/site"') + white(' • ') + chalk.magenta('"/img"') + white(' • ') + chalk.blue('"/tunnel"'));
  console.log(chalk.gray(' Digite comandos diretos ou fale naturalmente. Digite "/help" para ver tudo.\n'));
}

function startCLI() {
  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: whiteBold('verycode@cli~$ ')
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'sair' || input.toLowerCase() === 'exit') {
      console.log(orange('> Encerrando VeryCode CLI...'));
      process.exit(0);
    }

    // Reconhecimento de dezenas de formas de ligar o Modo IA
    if (isActivationAIMode(input)) {
      rl.close();
      startAIMode(apiKey);
      return;
    }

    // Roteamento de comandos e ações autônomas
    const routed = await routeUserAction(input, apiKey, 'cli');
    if (routed) {
      if (routed.type === 'inline') {
        routed.action();
        rl.prompt();
        return;
      }
      if (routed.type === 'exec_cmd') {
        await runCommandStream(routed.command);
        rl.prompt();
        return;
      }
      if (routed.type === 'async_action') {
        rl.close();
        await routed.run();
        startCLI();
        return;
      }
      if (routed.type === 'noop') {
        rl.prompt();
        return;
      }
    }

    const greeting = checkInstantGreeting(input);
    if (greeting) {
      console.log(`${orangeBold('verycode@ia~$')} ${orange('echo "' + greeting + '"')}\n`);
      console.log(white(greeting) + '\n');
      rl.prompt();
      return;
    }

    const rawCommand = await getBashCommands(input);
    const cleanCommand = rawCommand.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    await runCommandStream(cleanCommand);
    rl.prompt();
  });
}

startCLI();
