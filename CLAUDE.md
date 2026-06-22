# JARVIS v6 — Memoria do Projeto (CLAUDE.md)

Este arquivo guarda o que foi construido e as decisoes tomadas, para que qualquer
sessao futura tenha contexto. Atualizado ao fim de cada fase.

O operador **nao e desenvolvedor** — toda comunicacao deve ser em portugues simples.

---

## Estado atual: FASE F0 VENCIDA (GATE F0 aprovado pelo operador em 2026-06-22)

GATE F0 validado com os dois testes na frente do operador:
- Pergunta de pesquisa -> @analista respondeu (modelo claude-haiku-4-5, complexidade simples).
- Pergunta de decisao -> @arquiteto respondeu (modelo claude-opus-4-8, complexidade complexa).
O operador viu funcionando e aprovou.

Observacoes operacionais:
- A chave de API do operador esta em backend/.env (funcionando, com saldo). Operador
  optou por manter a chave atual por enquanto (ela passou pelo chat; pode ser trocada depois).
- Envio para o GitHub esta BLOQUEADO neste ambiente (git push e API GitHub retornam 403
  "Resource not accessible by integration"). O trabalho esta salvo em commits locais.
  Para publicar no GitHub sera preciso liberar permissao de escrita.

Proxima: FASE F1 (voz) — aguardando chave da OpenAI Realtime do operador.

### O que existe hoje

Um **backend cerebro** que recebe uma pergunta e responde usando **subagentes
especializados** via API da Anthropic. Tudo na pasta `backend/`.

- `backend/src/config.js`    — carrega o `.env` e os nomes dos modelos. Sem libs externas.
- `backend/src/anthropic.js` — cliente da API da Anthropic usando `fetch` nativo.
- `backend/src/agentes.js`   — os dois agentes (papeis): `@analista` e `@arquiteto`.
- `backend/src/roteador.js`  — le a pergunta e escolhe o agente + a complexidade.
- `backend/src/cerebro.js`   — orquestra: roteia, chama o(s) agente(s), devolve a resposta.
- `backend/src/cli.js`       — teste por linha de comando.
- `backend/src/server.js`    — servidor HTTP minimo (`/saude`, `/perguntar`).

### Decisoes importantes (e por que)

1. **Zero dependencias externas.** O ambiente de desenvolvimento bloqueia a
   instalacao de pacotes (npm e pip dao erro 403). Em vez de depender disso,
   o backend fala direto com a API da Anthropic usando o `fetch` ja embutido no
   Node. Isso, alem de resolver o bloqueio, respeita melhor a regra **R5**
   (nenhum framework externo que possa quebrar sem aviso).

2. **Linguagem: Node.js puro (JavaScript), nao TypeScript.** O documento
   recomendava Node+TypeScript, mas o compilador do TypeScript tambem precisaria
   ser instalado (bloqueado). JavaScript puro entrega a mesma coisa funcionando,
   sem instalacao. Decisao a favor de "mostrar funcionando" em vez de pureza de stack.

3. **Roteamento por complexidade (Passo 3 da F0).**
   - Pergunta **simples** -> modelo rapido: `claude-haiku-4-5`.
   - Pergunta **complexa** -> modelo capaz: `claude-opus-4-8`.
   - Nomes de modelo confirmados na documentacao vigente da API (familia Claude 4.x).

4. **Roteamento por agente.** Um classificador (rodando no Haiku) le a pergunta
   e decide: `analista`, `arquiteto` ou `ambos`. Se o classificador falhar, ha um
   plano B por palavras-chave para nunca travar.

5. **Seguranca da chave (R1 + R5).** A chave da API vive **somente** no
   `backend/.env`, que esta no `.gitignore` e nunca vai para o Git. O modelo
   `backend/.env.example` ensina como obter e onde colar a chave.

### Pendencia para vencer o GATE F0

Falta a **chave de API comercial da Anthropic** do operador, colada em
`backend/.env`. Sem ela nao da para mostrar uma resposta real. Assim que a chave
estiver no lugar, rodar os dois testes do gate (pergunta de pesquisa -> @analista;
pergunta de decisao -> @arquiteto) e confirmar com o operador.

### Como ligar (resumo)

```
cd backend
cp .env.example .env        # depois, editar .env e colar a chave real
node src/cli.js "sua pergunta"
# ou o servidor:
node src/server.js          # abre em http://localhost:8787
```

---

## Proximas fases (contexto)

- **F1** — voz fluida (Fast Path) acionando este backend (Deep Path). Precisa de
  chave da OpenAI Realtime.
- **F2** — celular como "oculos virtual" com HUD de 4 zonas simulado.
- **F3** — visao universal + filtro de nicho + memoria (R6).
- F4 a F6 — hardware fisico; nao se executa agora.
