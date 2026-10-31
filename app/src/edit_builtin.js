#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import chalk from 'chalk';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white.bold;
const filePath = path.resolve(process.cwd(), 'bash_builtins_custom.json');

if (!fs.existsSync(filePath)) {
  console.log(chalk.red('Erro: Ficheiro bash_builtins_custom.json não encontrado.'));
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function run() {
  console.clear();
  console.log(orange('=================================================='));
  console.log(white('     VERY SYSTEMS - EDITOR DE COMANDOS BUILTIN    '));
  console.log(orange('==================================================\n'));
  console.log(chalk.gray(`Total de comandos mapeados: ${Object.keys(data).length}\n`));

  const cmd = (await question(white('Digite o nome do comando para consultar/editar (ou "sair"): '))).trim();

  if (cmd.toLowerCase() === 'sair' || !cmd) {
    rl.close();
    return;
  }

  if (!data[cmd]) {
    console.log(chalk.yellow(`\nComando "${cmd}" não encontrado na lista. Adicionando como novo comando...`));
    data[cmd] = { descricao: "", regra_custom: "" };
  } else {
    console.log(chalk.cyan(`\n[Comando Selecionado: ${cmd}]`));
    console.log(chalk.white(`Descrição Atual: `) + chalk.gray(data[cmd].descricao));
    console.log(chalk.white(`Regra Atual: `) + chalk.yellow(data[cmd].regra_custom) + '\n');
  }

  const novaDescricao = await question(white('Nova Descrição (Enter para manter): '));
  if (novaDescricao.trim()) data[cmd].descricao = novaDescricao.trim();

  const novaRegra = await question(white('Nova Regra Personalizada (Enter para manter): '));
  if (novaRegra.trim()) data[cmd].regra_custom = novaRegra.trim();

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(chalk.green(`\n✓ Configuração do comando "${cmd}" guardada com sucesso em bash_builtins_custom.json!\n`));

  rl.close();
}

run();
