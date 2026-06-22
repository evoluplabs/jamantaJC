# JARVIS v6 — Backend Cerebro (Fase F0)

O cerebro do JARVIS: recebe uma pergunta e responde usando subagentes
especializados (`@analista` e `@arquiteto`) via API da Anthropic.

## Pre-requisitos

- Node.js 20 ou mais novo (este projeto nao instala nenhuma biblioteca externa).
- Uma chave de API **comercial** da Anthropic (comeca com `sk-ant-...`).

## Passo a passo

1. Coloque a chave no arquivo de configuracao:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Abra o `.env` e troque pela sua chave real:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Faca uma pergunta pela linha de comando:

   ```bash
   node src/cli.js "resuma as vantagens de energia solar"
   node src/cli.js "devo usar um carro eletrico ou a gasolina para a cidade?"
   ```

   A resposta mostra: o texto + **qual agente respondeu** + **qual modelo** foi usado.

3. (Opcional) Subir o servidor HTTP:

   ```bash
   node src/server.js
   ```

   - `GET  http://localhost:8787/saude`
   - `POST http://localhost:8787/perguntar`  com corpo `{ "pergunta": "..." }`

## Como funciona (resumo)

- Um **roteador** le a pergunta e decide o agente e a complexidade.
- Pergunta **simples** -> modelo rapido (`claude-haiku-4-5`).
- Pergunta **complexa** -> modelo capaz (`claude-opus-4-8`).
- A chave fica **so** no `.env` (nunca no Git).
