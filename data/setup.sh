#!/bin/bash

echo "[VERY SYSTEMS] Instalando dependências do VeryCode..."
npm install

chmod +x index.js

# Cria link simbólico global no ambiente local
if [ -d "$PREFIX/bin" ]; then
    # Ambiente Termux
    ln -sf "$(pwd)/index.js" "$PREFIX/bin/verycode"
    echo "[VERY SYSTEMS] Binário 'verycode' vinculado em $PREFIX/bin"
else
    # Linux Padrão
    sudo ln -sf "$(pwd)/index.js" /usr/local/bin/verycode 2>/dev/null || ln -sf "$(pwd)/index.js" "$HOME/.local/bin/verycode"
    echo "[VERY SYSTEMS] Binário 'verycode' vinculado ao PATH"
fi

echo "[VERY SYSTEMS] Instalação concluída com sucesso."
echo "Para executar diretamente, use: verycode"
