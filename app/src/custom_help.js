#!/usr/bin/env node

import chalk from 'chalk';
import { getAllCommands, scanAllSystemCommands } from './universal_scanner.js';

const orange = chalk.hex('#FF6600').bold;
const orangeLight = chalk.hex('#FFA347');
const white = chalk.white.bold;
const gray = chalk.gray;

const args = process.argv.slice(2);
const query = args.join(' ').toLowerCase().trim();

if (query === '--scan' || query === '-s') {
  console.log(orange('> Atualizando índice de todos os comandos do sistema...'));
  const all = scanAllSystemCommands();
  console.log(chalk.green(`✓ ${Object.keys(all).length} comandos indexados com sucesso!\n`));
  process.exit(0);
}

process.stdout.write("\x1Bc");
console.clear();
console.log(orange('==================================================================='));
console.log(white('        VERY SYSTEMS  •  SUPER TERMINAL & COMANDOS DA IA          '));
console.log(orange('==================================================================='));
console.log(gray(' Dica: Use os comandos diretos abaixo OU escreva com suas próprias palavras!'));
console.log(gray('───────────────────────────────────────────────────────────────────\n'));

console.log(white(' 🚀 COMANDOS AUTÔNOMOS DA IA (COMANDOS OU FALA NATURAL):'));
console.log(` ${orange('/site <nome> <tema>')}    ${gray('➔')} Cria site estruturado (html/css/js/svg)`);
console.log(` ${orange('/discord <nome>')}         ${gray('➔')} Cria bot modular para Discord (Discord.js v14)`);
console.log(` ${orange('/telegram <nome>')}        ${gray('➔')} Cria bot modular para Telegram (Telegraf v4)`);
console.log(` ${orange('/img <descrição>')}        ${gray('➔')} Gera imagem via IA em localhost:4000 sem marca`);
console.log(` ${orange('/tunnel <porta>')}         ${gray('➔')} Gera link público HTTPS seguro para o mundo`);
console.log(` ${orange('/deploy <projeto>')}       ${gray('➔')} Prepara discloud.config e pacote zip`);
console.log(` ${orange('/gitpush <msg>')}          ${gray('➔')} Faz commit e push automático para o GitHub`);
console.log(` ${orange('/apk <projeto>')}          ${gray('➔')} Injeta manifest PWA e prepara para app Android`);
console.log(` ${orange('/debug')} ou ${orange('/consertar')}     ${gray('➔')} Analisa logs e conserta dependências`);

console.log(white('\n 📁 GERENCIAMENTO DE PROJETOS E ARMAZENAMENTO:'));
console.log(` ${orange('/ls')} ou ${orange('ls')}               ${gray('➔')} Lista todos os projetos salvos no banco`);
console.log(` ${orange('/ligar <nome>')}           ${gray('➔')} Inicia servidor do site com parada via >desl`);
console.log(` ${orange('/mv <nome>')}              ${gray('➔')} Move a pasta do projeto para o celular (Storage)`);
console.log(` ${orange('/rm <nome>')}              ${gray('➔')} Remove o projeto da memória e apaga os arquivos`);
console.log(` ${orange('ia')}                      ${gray('➔')} Abre o modo de conversa técnica contínua`);
console.log(` ${orange('sair')}                    ${gray('➔')} Encerra o terminal VeryCode`);

console.log(gray('\n───────────────────────────────────────────────────────────────────'));
console.log(white(' ⚙️  CONSULTA DE BINÁRIOS DO LINUX/TERMUX:'));
console.log(gray(' Digite: ') + orange('help <comando>') + gray(' (ex: help git, help curl, help pkg, help tar)'));
console.log(gray('───────────────────────────────────────────────────────────────────\n'));

if (query) {
  const commandsMap = getAllCommands();
  if (commandsMap[query]) {
    const item = commandsMap[query];
    console.log(gray(' Detalhes do Binário do Sistema:'));
    console.log(` ${white('Comando:')}   ${orange(query)}`);
    console.log(` ${white('Tipo:')}      ${orangeLight(item.tipo || 'executável')}`);
    console.log(` ${white('Origem:')}    ${gray(item.origem || 'sistema')}`);
    console.log(` ${white('Descrição:')} ${chalk.white(item.descricao || 'Sem descrição cadastrada')}\n`);
  } else {
    console.log(chalk.red(` Nenhum comando correspondente ao termo: "${query}"\n`));
  }
}
