import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import { saveProject } from '../src/projects_manager.js';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white;

export async function setupDiscordBot(projectName, goal, token, apiKey, fetchFn) {
  const cleanName = projectName.replace(/^(chamado|chamada)\s+/i, '').replace(/[,;:'"]/g, '').trim();
  const slug = `discord_${cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  const botFolder = path.resolve(process.cwd(), 'projects', slug);

  fs.mkdirSync(path.join(botFolder, 'commands'), { recursive: true });
  fs.mkdirSync(path.join(botFolder, 'events'), { recursive: true });

  console.log(orange(`\n> [VERY SYSTEMS] A estruturar o bot de Discord "${cleanName}" nos bastidores...`));

  // 1. package.json silencioso
  const pkg = {
    name: slug,
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: { "start": "node index.js" },
    dependencies: { "discord.js": "^14.16.3", "dotenv": "^16.4.5" }
  };
  fs.writeFileSync(path.join(botFolder, 'package.json'), JSON.stringify(pkg, null, 2));

  // 2. Variáveis de ambiente blindadas (.env)
  fs.writeFileSync(path.join(botFolder, '.env'), `DISCORD_TOKEN=${token}\nCLIENT_ID=\n`);
  fs.writeFileSync(path.join(botFolder, '.gitignore'), `node_modules/\n.env\n`);

  // 3. Comando modular: commands/ping.js
  const pingCmd = `import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica o tempo de resposta do bot.'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'A calcular latência...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(\`Pong! Latência do bot: \${latency}ms\`);
  }
};
`;
  fs.writeFileSync(path.join(botFolder, 'commands', 'ping.js'), pingCmd);

  // 4. Evento modular: events/ready.js
  const readyEvt = `export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(\`[VERY SYSTEMS] Bot conectado como \${client.user.tag}!\`);
  }
};
`;
  fs.writeFileSync(path.join(botFolder, 'events', 'ready.js'), readyEvt);

  // 5. Núcleo com Carregamento Dinâmico: index.js
  const indexJs = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(\`file://\${filePath}\`);
  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(\`file://\${filePath}\`);
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args));
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Erro ao executar o comando.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Erro ao executar o comando.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
`;
  fs.writeFileSync(path.join(botFolder, 'index.js'), indexJs);

  // 6. Configuração para Discloud (discloud.config)
  fs.writeFileSync(path.join(botFolder, 'discloud.config'), `NAME=${cleanName}\nTYPE=bot\nMAIN=index.js\nRAM=100\nAUTORESTART=true\nVERSION=latest\n`);

  saveProject({
    name: cleanName,
    type: 'bot-discord',
    code: indexJs,
    description: goal,
    port: 0
  });

  console.log(chalk.green(`✓ Bot criado com sucesso em: `) + white(`projects/${slug}`));
  console.log(chalk.gray(`  Ficheiros gravados: package.json, .env, index.js, commands/ping.js, events/ready.js`));

  console.log(chalk.yellow('\n> A instalar dependências em segundo plano...'));
  const installProc = spawn('npm', ['install'], { cwd: botFolder, stdio: 'ignore' });

  installProc.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green(`✓ Dependências prontas! O bot está pronto a correr com: cd projects/${slug} && npm start\n`));
    }
  });
}
