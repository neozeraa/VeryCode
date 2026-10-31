import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import { saveProject } from '../src/projects_manager.js';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white;

export async function setupTelegramBot(projectName, goal, token) {
  const cleanName = projectName.replace(/^(chamado|chamada)\s+/i, '').replace(/[,;:'"]/g, '').trim();
  const slug = `tg_${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  const botFolder = path.resolve(process.cwd(), 'projects', slug);

  fs.mkdirSync(path.join(botFolder, 'commands'), { recursive: true });

  console.log(orange(`\n> [VERY SYSTEMS AI] Criando arquitetura do bot de Telegram "${cleanName}"...`));

  // 1. package.json
  const packageJson = {
    name: slug,
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: { "start": "node index.js" },
    dependencies: { "telegraf": "^4.16.3", "dotenv": "^16.4.5" }
  };
  fs.writeFileSync(path.join(botFolder, 'package.json'), JSON.stringify(packageJson, null, 2));

  // 2. .env
  fs.writeFileSync(path.join(botFolder, '.env'), `TELEGRAM_BOT_TOKEN=${token}\n`);

  // 3. index.js com comandos dinâmicos
  const indexJs = `import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

console.log('==================================================');
console.log('   [VERY SYSTEMS] BOT DO TELEGRAM INICIALIZADO!   ');
console.log('==================================================');

bot.start((ctx) => {
  ctx.reply(\`Olá \${ctx.from.first_name || 'usuário'}! Bem-vindo ao bot ${cleanName}.\\nUse /ajuda para ver os comandos.\`);
});

bot.help((ctx) => {
  ctx.reply('Comandos disponíveis:\\n• /start - Inicia o bot\\n• /ajuda - Mostra este menu\\n• /sobre - Informações do sistema');
});

bot.command('sobre', (ctx) => {
  ctx.reply('Bot desenvolvido com a tecnologia autônoma VERY SYSTEMS.');
});

bot.launch().then(() => {
  console.log('✓ Bot conectado e escutando mensagens no Telegram com sucesso!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
`;
  fs.writeFileSync(path.join(botFolder, 'index.js'), indexJs);

  // 4. README.md
  fs.writeFileSync(path.join(botFolder, 'README.md'), `# Bot Telegram: ${cleanName}\nCriado por VERY SYSTEMS.\nInicie com: \`npm install && npm start\``);

  saveProject({
    name: cleanName,
    type: 'bot-telegram',
    code: indexJs,
    description: goal,
    port: 0
  });

  console.log(chalk.green(`✓ Estrutura do bot de Telegram criada em: `) + white(botFolder));
  console.log(chalk.gray(`  ├── .env`));
  console.log(chalk.gray(`  ├── package.json`));
  console.log(chalk.gray(`  ├── index.js`));
  console.log(chalk.gray(`  └── README.md`));

  console.log(chalk.yellow('\n> Instalando dependências (telegraf e dotenv)...'));
  const npmInstall = spawn('npm', ['install'], { cwd: botFolder, stdio: 'inherit' });

  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✓ Dependências instaladas! Iniciando bot no Telegram...\n'));
      const botRun = spawn('node', ['index.js'], { cwd: botFolder, stdio: 'inherit' });
      botRun.on('close', (c) => console.log(chalk.gray(`Bot encerrado [status: ${c}]`)));
    }
  });
}
