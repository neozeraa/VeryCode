<div align="center">

# ⚡ VeryCode

**Super terminal para desenvolvimento, automação e diagnóstico, direto do celular ou do Linux.**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Plataforma](https://img.shields.io/badge/Plataforma-Termux%20%7C%20Linux-000000?logo=linux&logoColor=white)
![Packs](https://img.shields.io/badge/Knowledge%20Packs-100-orange)
![Módulos](https://img.shields.io/badge/Módulos-1.000-blue)

[Instalação](#-instalação) · [Comandos](#-comandos) · [Recursos](#-recursos) · [Base de conhecimento](#-base-de-conhecimento) · [Autor](#-autor)

</div>

---

## 📌 Sobre

O **VeryCode** reúne, em um único terminal, uma CLI rápida com realce de sintaxe em tempo real e um copiloto técnico embutido, a **VERY AI**. Foi pensado para quem programa no celular (Termux) ou no Linux e quer criar, corrigir e publicar projetos sem trocar de ferramenta.

A base de conhecimento (100 packs e 1.000 módulos) fica indexada localmente, então consultas técnicas, diagnósticos e modelos de projeto funcionam direto no disco.

## 🚀 Recursos

- **⚡ Sites e PWAs (`/site`)**: gera sites semânticos, landing pages e PWAs responsivos, com estilos como Glassmorphism, Bento Box e modo escuro com neon.
- **🤖 Fábrica de bots**: cria bots de Discord (discord.js v14, com comandos de barra e eventos modulares) e de WhatsApp (Baileys, com login por código e gestão de grupos).
- **🎨 Design vetorial**: gera logos, ícones em SVG e paletas de cores equilibradas.
- **🛡️ Autocorreção (self-healing)**: detecta e trata falhas comuns, como porta em uso (`EADDRINUSE`), módulos ausentes e consumo alto de RAM.
- **🔍 Análise de APIs e código**: mapeia fluxos de rede e contratos de APIs, desofusca código e ajuda a depurar projetos legados.
- **🌐 Hospedagem local**: micro-servidores HTTP leves, túneis públicos com QR Code no terminal e persistência em SQLite (modo WAL).

## 📥 Instalação

Requisitos: **Node.js 18+**, **Git** e Termux ou uma distro Linux.

```bash
git clone https://github.com/neozeraa/VeryCode.git
cd ~/VeryCode/central
npm install
node app/index.js
```

> No Termux, rode `pkg install nodejs git` antes, caso ainda não tenha os dois.

## ⌨️ Comandos

| Comando | O que faz |
| --- | --- |
| `verycode` | Abre o shell interativo com realce de sintaxe em tempo real. |
| `/ai` ou `/chat` | Conversa técnica com a VERY AI. |
| `/site` | Construtor de sites, landing pages e PWAs responsivos. |
| `/img <prompt>` | Cria prompts visuais cinematográficos, sem marcas d'água. |
| `/help --scan` | Reindexa os 100 packs de conhecimento no disco. |
| `/host` | Gerencia micro-servidores locais e túneis públicos com QR Code. |
| `voltar` | Volta ao terminal central a qualquer momento. |

## 📂 Base de conhecimento

São **100 packs** e **1.000 módulos** indexados localmente:

| Packs | Conteúdo |
| --- | --- |
| 01–31 | Diagnóstico de portas, sintaxe colorida, APIs e otimização de bancos de dados |
| 32–41 | Resiliência e contingência offline (Self-Sovereign Engine) |
| 42–51 | Microsserviços, Docker multi-stage, Git Flow e hardening de Linux |
| 52–61 | Fontes institucionais confiáveis e protocolos de fact-checking |
| 62–70 | Identidade e diretrizes da VERY AI |
| 71–75 | Análise de APIs e redes, desofuscação AST e APKs |
| 76–80 | Design visual avançado (Glassmorphism, Neon Glow e Bento Box) |
| 81–85 | Bots de Discord e WhatsApp com SQLite WAL |
| 86–90 | Prompts cinematográficos e supressão de artefatos visuais |
| 91–100 | Micro-servidores locais, webhooks Pix, deploy em nuvem e túneis de rede |

## 👤 Autor

Criado por **NeoZera**, da **VERY SYSTEMS**.

- GitHub: [@neozeraa](https://github.com/neozeraa)
- Instagram: [@very.systems](https://instagram.com/very.systems)

<div align="center">
<sub>VERY SYSTEMS · Tecnologia para acelerar a engenharia de software com autonomia.</sub>
</div>
