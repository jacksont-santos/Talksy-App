
# Talksy App

Frontend do aplicativo **Talksy App**, uma plataforma de criação e participação em salas de chat, com suporte a salas públicas e privadas, autenticação de usuários e comunicação em tempo real via WebSocket.

Este projeto é um **PWA** construído com **React + Vite** e integra-se aos microserviços de usuários, salas e servidor WebSocket.

---

## 🚀 Tecnologias Utilizadas

- **React** + **TypeScript**
- **Vite** (bundler)
- **TailwindCSS** (estilização)
- **Context API** (autenticação e WebSocket)
- **WebSocket** (tempo real)
- **PWA** (Progressive Web App)

---

## 📂 Estrutura de Pastas

```
src/
 ├── assets/              # Imagens, ícones e arquivos estáticos
 ├── components/          # Componentes reutilizáveis
 ├── contexts/            # Contextos de autenticação e WebSocket
 ├── hooks/               # Hooks customizados
 ├── pages/               # Páginas do app
 ├── services/            # Requisições para a API
 ├── types/               # Tipagens TypeScript
 ├── App.tsx              # Estrutura principal
 ├── main.tsx             # Ponto de entrada
 └── manifest.json        # Configuração PWA
```

---

## 📡 Funcionalidades

- **Cadastro e Login de Usuários**
- **Criação de Salas Públicas e Privadas**
- **Listagem e Busca de Salas**
- **Entrada em Salas Privadas via Senha**
- **Envio e Recebimento de Mensagens em Tempo Real**
- **Notificações de Novas Salas e Atualizações**
- **PWA Instalável**
- **Tema Claro/Escuro**

---

## 🔌 Integração com Backend

O frontend se comunica com:

- **Microserviço de Usuários** → autenticação e gerenciamento de contas
- **Microserviço de Salas** → criação, listagem e gerenciamento
- **Servidor WebSocket** → envio e recebimento de mensagens e notificações

---

## 📱 PWA

Este projeto é configurado como **Progressive Web App**, permitindo instalação no dispositivo.

---

## Links

- **https://github.com/jacksont-santos/ws-orquestrator**
- **https://github.com/jacksont-santos/Talksy-Server**

## Talksy App

https://talksy-app-hmtq.onrender.com
