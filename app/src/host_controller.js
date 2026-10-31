import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import chalk from 'chalk';

const orange = chalk.hex('#FF6600').bold;
const white = chalk.white.bold;

let activeServer = null;
const openSockets = new Set();

export function startHoster(targetDir, port = 3000, projectName = 'Projeto') {
  return new Promise((resolve) => {
    if (activeServer) {
      console.log(chalk.yellow('\nJá existe uma hospedagem em execução. Feche-a primeiro com >desl\n'));
      resolve();
      return;
    }

    activeServer = http.createServer((req, res) => {
      let reqPath = req.url === '/' ? 'index.html' : req.url.split('?')[0];
      let filePath = path.join(targetDir, reqPath);

      if (!fs.existsSync(filePath)) filePath = path.join(targetDir, 'index.html');

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Erro ao ler arquivo do projeto.');
        } else {
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
          res.end(data);
        }
      });
    });

    // Mapeia todas as conexões TCP abertas pelo navegador
    activeServer.on('connection', (socket) => {
      openSockets.add(socket);
      socket.on('close', () => openSockets.delete(socket));
    });

    activeServer.listen(port, () => {
      console.log('\n' + orange('=================================================='));
      console.log(white(`   HOSPEDAGEM ONLINE: ${projectName.toUpperCase()}`));
      console.log(orange('=================================================='));
      console.log(chalk.white(' • Acesso Local: ') + chalk.cyan.underline(`http://localhost:${port}`));
      console.log(chalk.gray(' Para desligar a hospedagem, digite: ') + orange('>desl') + chalk.gray(' ou ') + orange('desl') + '\n');

      const hostRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.hex('#FF6600').bold('> ')
      });

      hostRl.prompt();

      const shutdown = () => {
        // Força o encerramento de todas as conexões presas no Android/Navegador
        if (typeof activeServer.closeAllConnections === 'function') {
          activeServer.closeAllConnections();
        }
        for (const socket of openSockets) {
          socket.destroy();
        }
        openSockets.clear();

        activeServer.close(() => {
          console.log(chalk.red.bold(`\n[DESLIGADO] Projeto "${projectName}" desativado. Porta ${port} liberada.\n`));
          activeServer = null;
          hostRl.close();
          resolve();
        });
      };

      hostRl.on('line', (line) => {
        const cmd = line.trim().toLowerCase();
        if (cmd === '>desl' || cmd === 'desl' || cmd === '> desl' || cmd === 'desligar' || cmd === 'stop') {
          shutdown();
        } else {
          console.log(chalk.gray(`Servidor "${projectName}" ativo em http://localhost:${port}. Digite `) + orange('>desl') + chalk.gray(' para desligar.'));
          hostRl.prompt();
        }
      });
    });
  });
}
