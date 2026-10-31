import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white;

export async function generateFullSiteStructure({ projectName, promptUser, referenceData = "", apiKey, fetchFn }) {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const projectFolder = path.resolve(process.cwd(), 'projects', slug);

  // Criação da árvore de diretórios do site
  fs.mkdirSync(path.join(projectFolder, 'css'), { recursive: true });
  fs.mkdirSync(path.join(projectFolder, 'js'), { recursive: true });
  fs.mkdirSync(path.join(projectFolder, 'assets'), { recursive: true });

  console.log(orange(`\n> [VERY SYSTEMS AI] Projetando arquitetura completa de pastas para "${projectName}"...`));

  const systemPrompt = `Você é o Arquiteto Frontend sênior da VERY SYSTEMS.
Gere a estrutura completa de arquivos para o projeto web "${projectName}".
Instruções do usuário: "${promptUser}".
${referenceData ? `Referência inspecionada:\n${referenceData}\n` : ''}

Você DEVE responder ESTRITAMENTE com um JSON válido contendo exatamente as seguintes chaves de arquivos (sem formatação markdown \`\`\`json):
{
  "html": "código completo do index.html ligando css/style.css, js/main.js e a logo em assets/logo.svg",
  "css": "código completo e moderno de css/style.css responsivo mobile-first",
  "js": "código completo de js/main.js com interatividade real",
  "logo_svg": "código vetorial completo <svg ...>...</svg> para a marca ${projectName}",
  "readme": "# ${projectName}\\n\\nDesenvolvido com VeryCode CLI by VERY SYSTEMS."
}
NÃO adicione nenhum texto antes ou depois do JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.2 }
    })
  });

  const data = await res.json();
  let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  rawText = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

  let filesObj = {};
  try {
    filesObj = JSON.parse(rawText);
  } catch {
    // Fallback de contingência caso a resposta não seja JSON estrito
    filesObj = {
      html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${projectName}</title><link rel="stylesheet" href="css/style.css"></head><body><header><img src="assets/logo.svg" alt="${projectName}" width="180"><h1>${projectName}</h1></header><main><p>Projeto estruturado com sucesso.</p></main><script src="js/main.js"></script></body></html>`,
      css: `* { margin:0; padding:0; box-sizing:border-box; font-family:system-ui, sans-serif; } body { background:#0a0a0a; color:#fff; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; } header { text-align:center; margin-bottom:2rem; }`,
      js: `console.log('${projectName} inicializado com VERY SYSTEMS Engine.');`,
      logo_svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><rect width="200" height="60" rx="8" fill="#FF6600"/><text x="100" y="38" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${projectName}</text></svg>`,
      readme: `# ${projectName}\nDesenvolvido por VERY SYSTEMS.`
    };
  }

  // Gravação de todos os arquivos nos seus diretórios corretos
  fs.writeFileSync(path.join(projectFolder, 'index.html'), filesObj.html || '', 'utf-8');
  fs.writeFileSync(path.join(projectFolder, 'css', 'style.css'), filesObj.css || '', 'utf-8');
  fs.writeFileSync(path.join(projectFolder, 'js', 'main.js'), filesObj.js || '', 'utf-8');
  fs.writeFileSync(path.join(projectFolder, 'assets', 'logo.svg'), filesObj.logo_svg || '', 'utf-8');
  fs.writeFileSync(path.join(projectFolder, 'README.md'), filesObj.readme || '', 'utf-8');

  // Adiciona package.json estático para padronização de projeto
  const pkgData = {
    name: slug,
    version: "1.0.0",
    description: `Projeto ${projectName} criado via VeryCode CLI`,
    main: "index.html",
    author: "VERY SYSTEMS"
  };
  fs.writeFileSync(path.join(projectFolder, 'package.json'), JSON.stringify(pkgData, null, 2), 'utf-8');

  console.log(chalk.green(`✓ Estrutura completa de pastas gerada em: `) + white(projectFolder));
  console.log(chalk.gray(`  ├── index.html`));
  console.log(chalk.gray(`  ├── package.json`));
  console.log(chalk.gray(`  ├── README.md`));
  console.log(chalk.gray(`  ├── assets/logo.svg`));
  console.log(chalk.gray(`  ├── css/style.css`));
  console.log(chalk.gray(`  └── js/main.js`));

  return { projectFolder, slug };
}
