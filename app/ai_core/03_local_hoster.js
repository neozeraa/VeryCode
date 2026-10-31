import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

export function hostSiteLocally(projectDir, port = 3000) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(projectDir, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) filePath = path.join(projectDir, 'index.html');

    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Erro interno ao ler arquivo');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(port, () => {
    console.log(chalk.hex('#FF6600').bold(`\n==================================================`));
    console.log(chalk.white.bold(`       SITE HOSPEDADO EM LOCALHOST ATIVO          `));
    console.log(chalk.hex('#FF6600').bold(`==================================================`));
    console.log(chalk.white(` • URL de Acesso: `) + chalk.cyan.underline(`http://localhost:${port}`));
    console.log(chalk.gray(` Para encerrar a hospedagem deste site, feche o processo ou o terminal.\n`));
  });

  return server;
}
