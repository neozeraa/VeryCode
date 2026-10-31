
function searchOfflineKnowledge(query) {
  if (!query) return "Comando vazio recebido.";
  const cleanQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // 1. Busca direta nos arquivos de respostas imediatas (Pack 91)
  try {
    const pack91Dir = "training/knowledge/pack_91_unanswered_fallback_and_direct_answers";
    if (fs.existsSync(pack91Dir)) {
      const files = fs.readdirSync(pack91Dir);
      for (const f of files) {
        if (!f.endsWith(".json")) continue;
        const entry = JSON.parse(fs.readFileSync(path.join(pack91Dir, f), "utf-8"));
        if (entry.triggers) {
          for (const trig of entry.triggers) {
            const cleanTrig = trig.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (cleanQuery.includes(cleanTrig) || cleanTrig.includes(cleanQuery)) {
              return entry.direct_answer;
            }
          }
        }
      }
    }
  } catch {}

  // 2. Busca semântica nos mais de 90 packs indexados
  const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  let bestCandidate = "";
  let highestScore = 0;

  try {
    const list = JSON.parse(fullTrainingContext);
    for (const item of list) {
      const fullText = JSON.stringify(item).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let score = 0;
      for (const w of words) {
        if (fullText.includes(w)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestCandidate = item.summary || item.topic || (item.rules ? item.rules.join("\n") : "");
      }
    }
  } catch {}

  if (bestCandidate && highestScore > 0) {
    return bestCandidate;
  }

  return "VERY AI ativa no terminal VeryCode. Posso auxiliar na criacao de bots (Discord/WhatsApp), desenvolvimento de sites, analise de arquivos e configuracao de servidores.";
}


function formatBrandAndLanguageColors(str) {
  if (!str) return "";
  
  // 1. Linguagens de Programação com cores oficiais
  const languages = [
    { regex: /\b(python)\b/gi, color: "#FFD43B" },              // Amarelo Python 🟡
    { regex: /\b(javascript|js)\b/gi, color: "#F7DF1E" },          // Amarelo Claro JS
    { regex: /\b(typescript|ts)\b/gi, color: "#3178C6" },          // Azul TypeScript
    { regex: /\b(rust)\b/gi, color: "#DEA584" },                   // Laranja Ferrugem Rust
    { regex: /\b(golang|go)\b/gi, color: "#00ADD8" },              // Azul Ciano Go
    { regex: /\b(kotlin)\b/gi, color: "#7F52FF" },                 // Roxo Kotlin
    { regex: /\b(java)\b/gi, color: "#ED8B00" },                   // Laranja Escuro Java
    { regex: /\b(c\+\+|cpp)\b/gi, color: "#00599C" },            // Azul C++
    { regex: /\b(c)\b/g, color: "#A8B9CC" },                       // Cinza Azulado C
    { regex: /\b(c#|csharp)\b/gi, color: "#239120" },              // Verde C#
    { regex: /\b(php)\b/gi, color: "#777BB4" },                    // Roxo PHP
    { regex: /\b(bash|shell)\b/gi, color: "#89E051" },             // Verde Shell
    { regex: /\b(html|html5)\b/gi, color: "#E34F26" },             // Laranja Avermelhado HTML
    { regex: /\b(css|css3)\b/gi, color: "#1572B6" },               // Azul CSS
    { regex: /\b(sql|sqlite|mysql|postgresql)\b/gi, color: "#CC292B" } // Vermelho SQL
  ];

  // 2. Marcas e Redes Sociais
  const brands = [
    // Provedores e Dados Brasileiros (Pack 27)
    { regex: /\b(discloud)\b/gi, color: "#00E5FF" },
    { regex: /\b(square cloud)\b/gi, color: "#7B2CBF" },
    { regex: /\b(locaweb)\b/gi, color: "#E30613" },
    { regex: /\b(uol host|uolhost)\b/gi, color: "#1C9EB9" },
    { regex: /\b(kinghost)\b/gi, color: "#FF6600" },
    { regex: /\b(hostnet)\b/gi, color: "#005696" },
    { regex: /\b(hostgator brasil)\b/gi, color: "#FFD200" },
    { regex: /\b(latitude\.sh|maxihost)\b/gi, color: "#0066FF" },
    { regex: /\b(base dos dados)\b/gi, color: "#00994D" },
    { regex: /\b(dataprev)\b/gi, color: "#002B49" },
    { regex: /\b(serpro)\b/gi, color: "#004A80" },

    // 4. Principais Bancos de Dados do Pack 26
    { regex: /\b(postgresql|postgres)\b/gi, color: "#336791" },
    { regex: /\b(mysql)\b/gi, color: "#00758F" },
    { regex: /\b(sqlite)\b/gi, color: "#003B57" },
    { regex: /\b(redis)\b/gi, color: "#DC382D" },
    { regex: /\b(mongodb|mongo)\b/gi, color: "#47A248" },
    { regex: /\b(oracle database|oracle)\b/gi, color: "#F80000" },
    { regex: /\b(sql server|mssql)\b/gi, color: "#CC292B" },
    { regex: /\b(mariadb)\b/gi, color: "#003545" },
    { regex: /\b(cassandra)\b/gi, color: "#1287B1" },
    { regex: /\b(clickhouse)\b/gi, color: "#FFCC01" },
    { regex: /\b(dynamodb)\b/gi, color: "#4053D6" },
    { regex: /\b(supabase)\b/gi, color: "#3ECF8E" },
    { regex: /\b(neo4j)\b/gi, color: "#008CC1" },
    { regex: /\b(surrealdb)\b/gi, color: "#9500FF" },

    // 3. Provedores e Sistemas de Hospedagem do Pack 25
    { regex: /\b(aws|amazon web services)\b/gi, color: "#FF9900" },
    { regex: /\b(azure|microsoft azure)\b/gi, color: "#0078D4" },
    { regex: /\b(google cloud|gcp)\b/gi, color: "#4285F4" },
    { regex: /\b(discloud)\b/gi, color: "#00E5FF" },
    { regex: /\b(cloudflare|cloudflare pages|cloudflare workers)\b/gi, color: "#F38020" },
    { regex: /\b(vercel)\b/gi, color: "#FFFFFF" },
    { regex: /\b(render)\b/gi, color: "#46E3B7" },
    { regex: /\b(railway)\b/gi, color: "#9B51E0" },
    { regex: /\b(fly\.io|fly io)\b/gi, color: "#24185B" },
    { regex: /\b(heroku)\b/gi, color: "#6762A6" },
    { regex: /\b(digitalocean)\b/gi, color: "#0080FF" },
    { regex: /\b(hetzner)\b/gi, color: "#D50C2D" },
    { regex: /\b(ovhcloud|ovh)\b/gi, color: "#00539C" },
    { regex: /\b(vultr)\b/gi, color: "#007BFC" },
    { regex: /\b(hostinger)\b/gi, color: "#673AB7" },
    { regex: /\b(godaddy)\b/gi, color: "#00A4A6" },
    { regex: /\b(locaweb)\b/gi, color: "#E30613" },
    { regex: /\b(kinghost)\b/gi, color: "#FF6600" },
    { regex: /\b(hostgator)\b/gi, color: "#FFD200" },
    { regex: /\b(netlify)\b/gi, color: "#00C7B7" },

    { regex: /\b(youtube|youtuber|youtubers)\b/gi, color: "#FF0000" },
    { regex: /\b(discord)\b/gi, color: "#5865F2" },
    { regex: /\b(telegram)\b/gi, color: "#229ED9" },
    { regex: /\b(twitch)\b/gi, color: "#9146FF" },
    { regex: /\b(google|gemini)\b/gi, color: "#4285F4" },
    { regex: /\b(very systems|verycode)\b/gi, color: "#FF6600" },
    { regex: /\b(github)\b/gi, color: "#FFFFFF" },
    { regex: /\b(whatsapp)\b/gi, color: "#25D366" },
    { regex: /\b(instagram)\b/gi, color: "#E1306C" },
    { regex: /\b(spotify)\b/gi, color: "#1DB954" },
    { regex: /\b(openai|chatgpt)\b/gi, color: "#10A37F" }
  ];

  let res = str;

  for (const l of languages) {
    res = res.replace(l.regex, (m) => chalk.hex(l.color).bold(m));
  }

  for (const b of brands) {
    res = res.replace(b.regex, (m) => chalk.hex(b.color).bold(m));
  }

  return res;
}

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

import { routeUserAction } from '../src/action_router.js';

const __filename = fileURLToPath(import.meta.url);
const rootPath = path.resolve(path.dirname(__filename), '../..');

const orange = chalk.hex('#FF6600');
const orangeBold = chalk.hex('#FF6600').bold;
const white = chalk.white;
const whiteBold = chalk.white.bold;
const gray = chalk.gray;



function formatTerminalMarkdown(text) {
  if (!text) return '';
  let formatted = text;

  // Adiciona espaçamento suave antes de itens numerados (1., 2., etc.)
  formatted = formatted.replace(/(\n)(\d+\.\s+)/g, "$1\n$2");


  // Remove códigos hexadecimais vazados entre parênteses ou aspas: ('#00E5FF'), ("#FF6600"), (#FFF)
  formatted = formatted.replace(/\(\s*['"]?#[0-9a-fA-F]{3,8}['"]?\s*\)/g, "");

  // Converte crases soltas (`ficheiro`) para destaque em ciano no terminal
  formatted = formatted.replace(/`([^`\n]+)`/g, (m, p1) => chalk.cyan(p1));


  // Limpeza rígida de resíduos de tags HTML geradas pela IA
  formatted = formatted.replace(/<span[^>]*>/gi, "").replace(/<\/span>/gi, "");


  // Substitui títulos markdown por divisores estruturados
  formatted = formatted
    .replace(/^###\s+(.+)$/gm, (m, p1) => '\n' + chalk.hex('#FF6600').bold(p1) + '\n' + chalk.gray('----------------------------------------'))
    .replace(/^##\s+(.+)$/gm, (m, p1) => '\n' + chalk.white.bold.underline(p1) + '\n' + chalk.hex('#FF6600')('----------------------------------------'));

  // Respostas estruturadas sobre YouTubers ou canais
  if (/(\byoutube|\byoutuber|canal\b)/i.test(formatted) && formatted.length > 250) {
    if (!formatted.includes('----------------------------------------')) {
      formatted = formatted.replace(/(Principais\s+[\w\s]+:|Características:?)/i, '\n' + chalk.gray('----------------------------------------') + '\n' + chalk.hex('#FF6600').bold('$1') + '\n' + chalk.gray('----------------------------------------'));
    }
  }

  // Remove qualquer asterisco duplo (**texto**) ou simples (*texto*) colorindo com tom de destaque
  formatted = formatted
    .replace(/\*\*(.+?)\*\*/g, (m, p1) => chalk.hex('#FF8800').bold(p1))
    .replace(/\*([^\*\n]+?)\*/g, (m, p1) => chalk.hex('#FFAA33')(p1));

  // Texto entre aspas duplas ("...") formatado em AZUL
  formatted = formatted.replace(/"([^"\n]+)"/g, (m, p1) => chalk.hex('#00BFFF').bold(`"${p1}"`));

  // Aplica as cores oficiais das marcas
  formatted = formatBrandAndLanguageColors(formatted);

  return formatted;
}

let fullTrainingContext = '';
try {
  const folders = [
    path.join(rootPath, 'training', 'knowledge'),
    path.join(rootPath, 'training', 'linux_core')
  ];
  const combined = [];
  for (const dir of folders) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true }).filter(f => typeof f === 'string' && f.endsWith('.json'));
      for (const file of files) {
        try {
          combined.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')));
        } catch {}
      }
    }
  }
  fullTrainingContext = JSON.stringify(combined);
} catch {
  fullTrainingContext = 'Bases ativas.';
}

export function startAIMode(apiKey) {
  console.clear();
  console.log(orangeBold('=================================================='));
  console.log(whiteBold('           VERYCODE  •  MODO IA ATIVO             '));
  console.log(orange('               Powered by VERY SYSTEMS            '));
  console.log(orangeBold('=================================================='));
  console.log(white(' Dica: Digite comandos diretos (/site, /img, /help) ou converse normalmente!'));
  console.log(gray(' Digite "voltar" para retornar ao terminal principal.\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: orangeBold('verycode@ai(chat)~$ ')
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === 'voltar' || input.toLowerCase() === 'sair') {
      console.log(orange('> Retornando ao VeryCode CLI...\n'));
      rl.close();
      return;
    }

    const routed = await routeUserAction(input, apiKey, 'ai');
    if (routed) {
      if (routed.type === 'inline') {
        routed.action();
        rl.prompt();
        return;
      }
      if (routed.type === 'exec_cmd') {
        const { execSync } = await import('node:child_process');
        try {
          execSync(routed.command, { stdio: 'inherit' });
        } catch {}
        rl.prompt();
        return;
      }
      if (routed.type === 'async_action') {
        rl.close();
        await routed.run();
        startAIMode(apiKey);
        return;
      }
      if (routed.type === 'noop') {
        rl.prompt();
        return;
      }
    }

    try {
      process.stdout.write(gray('> A processar com máxima precisão...\n'));
      const systemInstruction = `Você é o assistente técnico oficial da VERY SYSTEMS integrado ao terminal VeryCode.
Responda com rigor factual e precisão técnica em linguagem direta.
REGRA SUPREMA DE VISUALIZAÇÃO:
- NUNCA escreva códigos hexadecimais de cor (ex.: #00E5FF, #FF6600) no meio do texto, parênteses ou explicações.
- As cores são injetadas exclusivamente pelo terminal, nunca as mencione de forma literal no texto.
- É TERMINANTEMENTE PROIBIDO exibir blocos de código ou comandos de terminal no meio da resposta explicativa.
- É TERMINANTEMENTE PROIBIDO exibir blocos de código ou comandos de terminal no meio da resposta explicativa.
- Responda apenas com explicações, passos conceituais e resumos em texto puro.
- O código bruto deve ser gerado e gravado diretamente nos arquivos do projeto em background pelos builders, sem ser despejado na tela.
Contexto ativo:
${fullTrainingContext}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: input }] }],
          generationConfig: { temperature: 0.2 }
        })
      });

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';
      console.log(`\n${formatTerminalMarkdown(reply)}\n`);
    } catch (e) {
      const fallback = searchOfflineKnowledge(input);
      console.log(`\n${formatTerminalMarkdown(fallback)}\n`);
    }

    rl.prompt();
  });
}
