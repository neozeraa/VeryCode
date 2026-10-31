import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import chalk from 'chalk';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white.bold;
const gray = chalk.gray;

let imageServer = null;
const imageSockets = new Set();
let currentImageBuffer = null;
let currentPromptName = "arte";

// 1. Otimiza o prompt com as novas regras cinematográficas do Pack 18
async function optimizePromptWithGemini(userPrompt, apiKey) {
  try {
    const systemPrompt = `Você é o diretor de arte e engenheiro visual mestre da VERY SYSTEMS (Pack 18).
Transforme o pedido do usuário em um prompt em inglês de altíssimo nível cinematográfico:
- Adicione: 8k resolution, cinematic dramatic rim lighting, unreal engine 5 render, sharp focus, ray tracing, masterpiece, hyperdetailed textures.
- Negativos embutidos: clean background, without watermark, no text, no logo, no labels, no signatures, no deformed anatomy.
- Mantenha exatamente o sujeito, cor e elementos pedidos pelo usuário.
Retorne ESTRITAMENTE o prompt em inglês puro, sem aspas e sem explicações.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text;
  } catch {}
  return `${userPrompt}, highly detailed, cinematic rim lighting, 8k, unreal engine 5, sharp focus, no text, no watermark`;
}

// 2. Renderização e corte anti-watermark
export async function generateAiImage(promptDesc, apiKey) {
  currentPromptName = promptDesc.slice(0, 25).toLowerCase().replace(/[^a-z0-9_-]/g, '_') || "arte";
  process.stdout.write(orange(`\n> [VERY SYSTEMS AI] Aplicando engenharia visual cinematográfica (Pack 18)...\n`));

  const promptFinal = await optimizePromptWithGemini(promptDesc, apiKey);
  process.stdout.write(orange(`> [VERY SYSTEMS AI] Renderizando arte em alta resolução sem marca d'água...\n`));

  const seed = Math.floor(Math.random() * 899999) + 100000;
  const encoded = encodeURIComponent(promptFinal);
  const targetUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true&nofeed=true&model=flux`;

  const res = await fetch(targetUrl);
  if (!res.ok) {
    throw new Error(`Falha no servidor de renderização (HTTP ${res.status})`);
  }

  const rawBuffer = Buffer.from(await res.arrayBuffer());

  // Tratamento pós-processamento com ImageMagick (se presente) para garantir zero resíduos
  const tmpRaw = path.resolve(process.cwd(), 'temp_raw.png');
  const tmpClean = path.resolve(process.cwd(), 'temp_clean.png');

  try {
    fs.writeFileSync(tmpRaw, rawBuffer);
    execSync(`magick "${tmpRaw}" -gravity South -chop 0x42 "${tmpClean}" 2>/dev/null || convert "${tmpRaw}" -gravity South -chop 0x42 "${tmpClean}" 2>/dev/null`);
    currentImageBuffer = fs.readFileSync(tmpClean);
    fs.unlinkSync(tmpRaw);
    fs.unlinkSync(tmpClean);
  } catch {
    currentImageBuffer = rawBuffer;
    if (fs.existsSync(tmpRaw)) fs.unlinkSync(tmpRaw);
  }

  return currentImageBuffer;
}

// 3. Servidor Localhost:4000
export function hostImageScreen(port = 4000) {
  return new Promise((resolve) => {
    if (imageServer) {
      console.log(chalk.yellow('\nServidor de imagem já aberto. Encerre com > desl primeiro.\n'));
      resolve();
      return;
    }

    imageServer = http.createServer((req, res) => {
      if (req.url === '/image.png') {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Disposition': 'inline; filename="imagem_verycode.png"'
        });
        res.end(currentImageBuffer);
        return;
      }

      if (req.url === '/download') {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${currentPromptName}_verycode.png"`
        });
        res.end(currentImageBuffer);
        return;
      }

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VERY SYSTEMS • Master Visual Studio</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
    body {
      background: #0a0a0a;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: #141414;
      border: 1px solid #262626;
      border-radius: 16px;
      padding: 1.5rem;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.9);
    }
    .img-container {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #FF6600;
      background: #000;
      margin-bottom: 1.5rem;
    }
    .img-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #FF6600;
    }
    .desc {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 1.5rem;
    }
    .btn-download {
      display: inline-block;
      width: 100%;
      background: #FF6600;
      color: #000;
      font-weight: bold;
      text-decoration: none;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }
    .btn-download:hover {
      background: #ff7d26;
      box-shadow: 0 0 20px rgba(255, 102, 0, 0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="img-container">
      <img src="/image.png" alt="Arte Cinematográfica VERY SYSTEMS">
    </div>
    <div class="title">VERY SYSTEMS • STUDIO CINEMATOGRÁFICO</div>
    <div class="desc">Renderização com iluminação volumétrica e sem marcas d'água. Baixe abaixo:</div>
    <a href="/download" class="btn-download" download="${currentPromptName}_verycode.png">⬇ Baixar Imagem</a>
  </div>
</body>
</html>`;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });

    imageServer.on('connection', (sock) => {
      imageSockets.add(sock);
      sock.on('close', () => imageSockets.delete(sock));
    });

    imageServer.listen(port, () => {
      console.log('\n' + orange('=================================================='));
      console.log(white('       TELA DE IMAGEM ATIVA • LOCALHOST:4000      '));
      console.log(orange('=================================================='));
      console.log(chalk.white(' • Acesso no Navegador: ') + chalk.cyan.underline(`http://localhost:${port}`));
      console.log(chalk.gray(' • Para salvar na pasta permanente: digite ') + orange('salvar'));
      console.log(chalk.gray(' • Para fechar o servidor: digite ') + orange('>desl') + chalk.gray(' ou ') + orange('desl') + '\n');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.hex('#FF6600').bold('> ')
      });

      rl.prompt();

      const closeHoster = () => {
        if (typeof imageServer.closeAllConnections === 'function') imageServer.closeAllConnections();
        for (const s of imageSockets) s.destroy();
        imageSockets.clear();
        imageServer.close(() => {
          console.log(chalk.red.bold('\n[HOSPEDAGEM ENCERRADA] Servidor da porta 4000 desligado.\n'));
          imageServer = null;
          rl.close();
          resolve();
        });
      };

      rl.on('line', (line) => {
        const cmd = line.trim().toLowerCase();

        if (cmd === 'salvar' || cmd === '> salvar' || cmd === '>salvar') {
          saveToVeryCodeImgDir();
          rl.prompt();
          return;
        }

        if (cmd === 'desl' || cmd === '>desl' || cmd === '> desl' || cmd === 'desligar') {
          closeHoster();
          return;
        }

        console.log(chalk.gray('Servidor em http://localhost:4000. Opções: ') + orange('salvar') + chalk.gray(' ou ') + orange('>desl'));
        rl.prompt();
      });
    });
  });
}

function saveToVeryCodeImgDir() {
  if (!currentImageBuffer) {
    console.log(chalk.red('Nenhuma imagem na memória para salvar.'));
    return;
  }

  let baseDir = path.resolve(process.env.HOME || '', 'storage', 'shared', 'VERYCODE IMG');
  if (!fs.existsSync(path.resolve(process.env.HOME || '', 'storage', 'shared'))) {
    baseDir = path.resolve('/sdcard', 'VERYCODE IMG');
  }

  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch {
      baseDir = path.resolve(process.cwd(), 'VERYCODE_IMG');
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }

  const fileName = `img_${Date.now()}_${currentPromptName}.png`;
  const fullPath = path.join(baseDir, fileName);

  fs.writeFileSync(fullPath, currentImageBuffer);
  console.log(chalk.green.bold('\n✓ IMAGEM SALVA COM SUCESSO!'));
  console.log(chalk.white(' • Local: ') + chalk.cyan(fullPath));
  console.log(chalk.gray(' Imagem gravada em formato .PNG limpo.\n'));
}

export function isImageRequest(input) {
  const clean = input.toLowerCase().trim();
  const sanitizado = clean.replace(/^verycode@[a-z0-9()~$-]+\s*/i, '').trim();

  if (/^(\/)?img\s+/i.test(sanitizado)) {
    return sanitizado.replace(/^(\/)?img\s+/i, '').trim();
  }

  const regexVariacoes = /^(quero\s+(que\s+)?(voc[eê]|vc)\s+)?(crie|criar|gere|gerar|fa[cç]a|faca|monte|montar|desenhe|desenhar|produza|produzir|renderize|renderizar|ilustre|ilustrar|invente|elabore|construa)\s+(para\s+mim\s+)?(uma\s+|um\s+)?(imagem|foto|desenho|arte|ilustra[cç][aã]o|avatar|wallpaper|papel\s+de\s+parede|quadro|banner|gr[aá]fico|render|figura|estampa|paisagem|visual)\s+(de\s+|do\s+|da\s+|com\s+|sobre\s+|mostrando\s+|estilo\s+)?(.+)$/i;

  const match = sanitizado.match(regexVariacoes);
  if (match && match[9]) {
    return match[9].trim();
  }

  return null;
}
