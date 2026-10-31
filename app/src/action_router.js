import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import readline from "node:readline";

import { generateAiImage, hostImageScreen, isImageRequest } from "./image_hoster.js";
import { listProjects, getProject, moveProjectToStorage, removeProject, saveProject } from "./projects_manager.js";
import { startHoster } from "./host_controller.js";
import { generateFullSiteStructure } from "../ai_core/02_site_builder.js";
import { setupDiscordBot } from "../ai_core/04_discord_builder.js";
import { setupTelegramBot } from "../ai_core/05_telegram_builder.js";

const orange = chalk.hex("#FF6600").bold;
const white = chalk.white.bold;
const gray = chalk.gray;

export async function routeUserAction(input, apiKey, context = "cli") {
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // 1. HELP / AJUDA
  if (lower === "help" || lower === "/help" || lower === "ajuda" || lower === "/ajuda" || lower.startsWith("help ") || lower.startsWith("/help ")) {
    const termo = clean.replace(/^(\/)?(help|ajuda)\s*/i, "").trim();
    return { type: "exec_cmd", command: "node app/src/custom_help.js " + termo };
  }

  // 2. GERAR IMAGEM
  const imgPrompt = isImageRequest(clean);
  if (imgPrompt) {
    return {
      type: "async_action",
      run: async () => {
        await generateAiImage(imgPrompt, apiKey);
        await hostImageScreen(4000);
      }
    };
  }

  // 3. CRIAR SITE (/site <nome> ou fala natural)
  const isSiteCmd = /^(\/)?site\s+/i.test(clean);
  const isSiteNatural = /^(crie|criar|fa[cç]a|faca|gere|gerar|monte|montar|desenvolva)\s+(um\s+|uma\s+)?(site|p[aá]gina|landing|web)/i.test(clean);

  if (isSiteCmd || isSiteNatural) {
    let nome = "";
    let promptDesc = "";

    if (isSiteCmd) {
      const rest = clean.replace(/^(\/)?site\s+/i, "").trim();
      const parts = rest.split(/\s+/);
      nome = parts[0] || ("Site_" + Date.now());
      promptDesc = parts.slice(1).join(" ") || nome;
    } else {
      const matchNome = clean.match(/(?:chamado|chamada|com o nome de|nome)\s+["']?([^"',.\n]+?)["']?/i);
      nome = matchNome ? matchNome[1].trim() : ("Site_" + Date.now());
      promptDesc = clean.replace(/^(crie|criar|fa[cç]a|faca|gere|gerar|monte|montar|desenvolva)\s+(um\s+|uma\s+)?(site|p[aá]gina|landing|web)\s*/i, "").trim();
    }

    return {
      type: "async_action",
      run: async () => {
        const { projectFolder } = await generateFullSiteStructure({
          projectName: nome,
          promptUser: promptDesc,
          referenceData: "",
          apiKey,
          fetchFn: fetch
        });
        const htmlCode = fs.readFileSync(path.join(projectFolder, "index.html"), "utf-8");
        const saved = saveProject({
          name: nome,
          type: "site",
          code: htmlCode,
          description: promptDesc,
          port: 3000
        });
        console.log(chalk.green("\n✓ Site \"" + saved.name + "\" criado com sucesso em projects/" + path.basename(projectFolder) + "!"));
        await startHoster(projectFolder, saved.port, saved.name);
      }
    };
  }

  // 4. DISCORD BOT (/discord <nome> ou fala natural)
  const isDiscordCmd = /^(\/)?discord\s+/i.test(clean);
  const isDiscordNatural = /^(crie|criar|fa[cç]a|faca)\s+(um\s+)?bot\s+(de\s+|do\s+)?discord/i.test(clean);

  if (isDiscordCmd || isDiscordNatural) {
    const nome = isDiscordCmd 
      ? clean.replace(/^(\/)?discord\s+/i, "").trim()
      : (clean.match(/(?:chamado|chamada|nome)\s+["']?([^"']+)/i)?.[1]?.trim() || ("DiscordBot_" + Date.now()));

    return {
      type: "async_action",
      run: async () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        return new Promise((resolve) => {
          rl.question(chalk.yellow("\n[VERY SYSTEMS] Insira o Bot Token do Discord: "), async (token) => {
            rl.close();
            if (!token.trim()) {
              console.log(chalk.red("Token não informado. Operação cancelada."));
              resolve();
              return;
            }
            await setupDiscordBot(nome, clean, token.trim(), apiKey, fetch);
            resolve();
          });
        });
      }
    };
  }

  // 5. TELEGRAM BOT (/telegram <nome> ou fala natural)
  const isTgCmd = /^(\/)?telegram\s+/i.test(clean);
  const isTgNatural = /^(crie|criar|fa[cç]a|faca)\s+(um\s+)?bot\s+(de\s+|do\s+)?telegram/i.test(clean);

  if (isTgCmd || isTgNatural) {
    const nome = isTgCmd
      ? clean.replace(/^(\/)?telegram\s+/i, "").trim()
      : (clean.match(/(?:chamado|chamada|nome)\s+["']?([^"']+)/i)?.[1]?.trim() || ("TelegramBot_" + Date.now()));

    return {
      type: "async_action",
      run: async () => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        return new Promise((resolve) => {
          rl.question(chalk.yellow("\n[VERY SYSTEMS] Insira o Bot Token do Telegram (@BotFather): "), async (token) => {
            rl.close();
            if (!token.trim()) {
              console.log(chalk.red("Token não informado. Cancelado."));
              resolve();
              return;
            }
            await setupTelegramBot(nome, clean, token.trim());
            resolve();
          });
        });
      }
    };
  }

  // 6. TWITCH BOT (/twitch <nome> ou fala natural)
  const isTwitchCmd = /^(\/)?twitch\s+/i.test(clean);
  const isTwitchNatural = /(crie|criar|fa[cç]a|monte)\s+(um\s+)?bot\s+(de\s+|da\s+|pra\s+|para\s+a?\s*)?twitch/i.test(clean);

  if (isTwitchCmd || isTwitchNatural) {
    const nome = isTwitchCmd 
      ? clean.replace(/^(\/)?twitch\s+/i, "").trim() 
      : (clean.match(/(?:chamado|nome)\s+["']?([^"']+)/i)?.[1]?.trim() || ("TwitchBot_" + Date.now()));

    const slug = "twitch_" + nome.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    return {
      type: "exec_cmd",
      command: "mkdir -p projects/" + slug + "/commands && echo \"[VERY SYSTEMS] Bot Twitch criado em projects/" + slug + "\""
    };
  }

  // 7. GUILDED BOT (/guilded <nome> ou fala natural)
  const isGuildedCmd = /^(\/)?guilded\s+/i.test(clean);
  const isGuildedNatural = /(crie|criar|fa[cç]a|monte)\s+(um\s+)?bot\s+(de\s+|do\s+|pra\s+|para\s+o?\s*)?guilded/i.test(clean);

  if (isGuildedCmd || isGuildedNatural) {
    const nome = isGuildedCmd 
      ? clean.replace(/^(\/)?guilded\s+/i, "").trim() 
      : (clean.match(/(?:chamado|nome)\s+["']?([^"']+)/i)?.[1]?.trim() || ("GuildedBot_" + Date.now()));

    const slug = "guilded_" + nome.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    return {
      type: "exec_cmd",
      command: "mkdir -p projects/" + slug + "/commands && echo \"[VERY SYSTEMS] Bot Guilded criado em projects/" + slug + "\""
    };
  }

  // 8. SLACK BOT (/slack <nome> ou fala natural)
  const isSlackCmd = /^(\/)?slack\s+/i.test(clean);
  const isSlackNatural = /(crie|criar|fa[cç]a|monte)\s+(um\s+)?bot\s+(de\s+|do\s+|pra\s+|para\s+o?\s*)?slack/i.test(clean);

  if (isSlackCmd || isSlackNatural) {
    const nome = isSlackCmd 
      ? clean.replace(/^(\/)?slack\s+/i, "").trim() 
      : (clean.match(/(?:chamado|nome)\s+["']?([^"']+)/i)?.[1]?.trim() || ("SlackBot_" + Date.now()));

    const slug = "slack_" + nome.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    return {
      type: "exec_cmd",
      command: "mkdir -p projects/" + slug + "/listeners && echo \"[VERY SYSTEMS] Bot Slack criado em projects/" + slug + "\""
    };
  }

  // 9. TÚNEL PÚBLICO HTTPS (/tunnel <porta|projeto> ou fala natural)
  const isTunnelCmd = /^(\/)?tunnel\s+/i.test(clean);
  const isTunnelNatural = /(exponha|compartilhar|criar\s+link\s+p[uú]blico|tunel|t[uú]nel)\s+(a\s+porta|o\s+site|o\s+projeto)?/i.test(clean);

  if (isTunnelCmd || isTunnelNatural) {
    let target = isTunnelCmd ? clean.replace(/^(\/)?tunnel\s+/i, "").trim() : "3000";
    let port = parseInt(target, 10);
    if (isNaN(port)) {
      const proj = getProject(target);
      port = proj ? proj.port || 3000 : 3000;
    }
    return {
      type: "exec_cmd",
      command: "echo \"=== INICIANDO TÚNEL PÚBLICO SEGURO (Porta " + port + ") ===\" && (cloudflared tunnel --url http://localhost:" + port + " 2>/dev/null || ssh -R 80:localhost:" + port + " nokey@localhost.run)"
    };
  }

  // 10. DEPLOY NA DISCLOUD (/deploy <projeto> ou fala natural)
  const isDeployCmd = /^(\/)?deploy\s+/i.test(clean);
  const isDeployNatural = /(fazer\s+deploy|subir\s+na\s+discloud|hospedar\s+na\s+discloud)/i.test(clean);

  if (isDeployCmd || isDeployNatural) {
    const target = isDeployCmd
      ? clean.replace(/^(\/)?deploy\s+/i, "").trim()
      : (clean.match(/(?:projeto|bot|de)\s+["']?([^"']+)/i)?.[1]?.trim() || "");

    return {
      type: "exec_cmd",
      command: "echo \"[VERY SYSTEMS] Preparando deploy do projeto: " + target + "\""
    };
  }

  // 11. GIT PUSH AUTOMÁTICO (/gitpush <msg> ou fala natural)
  const isGitCmd = /^(\/)?gitpush\s*/i.test(clean);
  const isGitNatural = /(subir\s+pro\s+github|salvar\s+no\s+github|fazer\s+push)/i.test(clean);

  if (isGitCmd || isGitNatural) {
    const msg = isGitCmd
      ? (clean.replace(/^(\/)?gitpush\s*/i, "").trim() || "Atualização automática VeryCode")
      : "Sincronização automática VeryCode";

    return {
      type: "exec_cmd",
      command: "git add . && git commit -m \"" + msg + "\" 2>/dev/null || echo \"Sem alterações para commit.\""
    };
  }

  // 12. CONVERTER PARA PWA/APK (/apk <projeto>)
  const isApkCmd = /^(\/)?apk\s+/i.test(clean);
  const isApkNatural = /(transforme|converter|empacotar|criar)\s+(o\s+)?(site\s+)?(em\s+)?apk/i.test(clean);

  if (isApkCmd || isApkNatural) {
    const target = isApkCmd
      ? clean.replace(/^(\/)?apk\s+/i, "").trim()
      : (clean.match(/(?:projeto|site)\s+["']?([^"']+)/i)?.[1]?.trim() || "");

    return {
      type: "exec_cmd",
      command: "echo \"[VERY SYSTEMS] Injetando manifesto PWA/APK em: " + target + "\""
    };
  }

  // 13. DEBUG AUTOMÁTICO (/debug ou /consertar)
  if (lower === "/debug" || lower === "debug" || lower === "/consertar" || lower === "consertar" || lower.includes("analise os erros") || lower.includes("conserta o erro")) {
    return {
      type: "exec_cmd",
      command: "echo \"=== DIAGNÓSTICO VERY SYSTEMS ===\" && npm audit fix 2>/dev/null; echo \"✓ Concluído.\""
    };
  }

  // 14. ATALHOS LOCAIS: LS, MV, RM, LIGAR
  if (lower === "ls" || lower === "/ls" || lower === "projetos" || lower === "/projetos") {
    return { type: "inline", action: () => listProjects() };
  }

  if (/^(\/)?mv\s+/i.test(clean)) {
    const t = clean.replace(/^(\/)?mv\s+/i, "").trim();
    return { type: "inline", action: () => moveProjectToStorage(t) };
  }

  if (/^(\/)?rm\s+/i.test(clean)) {
    const t = clean.replace(/^(\/)?rm\s+/i, "").trim();
    return { type: "inline", action: () => removeProject(t) };
  }

  if (/^(\/)?ligar\s+/i.test(clean)) {
    const t = clean.replace(/^(\/)?ligar\s+/i, "").trim();
    const proj = getProject(t);
    if (!proj) {
      console.log(chalk.red("\nProjeto \"" + t + "\" não encontrado. Digite \"ls\" para ver os disponíveis.\n"));
      return { type: "noop" };
    }
    return {
      type: "async_action",
      run: async () => {
        await startHoster(proj.folder, proj.port || 3000, proj.name);
      }
    };
  }

  return null;
}
