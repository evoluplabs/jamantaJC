// server.js — um servidor HTTP minimo (sem frameworks externos, R5) para o
// cerebro. Serve para testar pelo navegador/app e ja prepara o caminho do
// Deep Path da Fase F1.
//
// Endpoints:
//   GET  /saude          -> diz se o servidor esta vivo e se a chave esta ok
//   POST /perguntar      -> body JSON { "pergunta": "..." } -> resposta do cerebro

import { createServer } from 'node:http';
import { pensar } from './cerebro.js';
import { chaveConfigurada } from './config.js';
import { listarAgentes } from './agentes.js';

const PORTA = process.env.PORT || 8787;

function enviarJson(res, status, obj) {
  const corpo = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  });
  res.end(corpo);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let dados = '';
    req.on('data', (c) => (dados += c));
    req.on('end', () => resolve(dados));
    req.on('error', reject);
  });
}

const servidor = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    enviarJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && req.url === '/saude') {
    enviarJson(res, 200, {
      status: 'ok',
      chaveConfigurada: chaveConfigurada(),
      agentes: listarAgentes().map((a) => ({ nome: a.nome, descricao: a.descricao })),
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/perguntar') {
    if (!chaveConfigurada()) {
      enviarJson(res, 500, {
        erro: 'Chave da API ausente. Configure ANTHROPIC_API_KEY no backend/.env',
      });
      return;
    }
    try {
      const corpo = await lerCorpo(req);
      const { pergunta } = JSON.parse(corpo || '{}');
      if (!pergunta || !pergunta.trim()) {
        enviarJson(res, 400, { erro: 'Envie { "pergunta": "..." }' });
        return;
      }
      const r = await pensar(pergunta.trim());
      enviarJson(res, 200, r);
    } catch (erro) {
      enviarJson(res, 500, { erro: erro.message });
    }
    return;
  }

  enviarJson(res, 404, { erro: 'Rota nao encontrada. Use GET /saude ou POST /perguntar' });
});

servidor.listen(PORTA, () => {
  console.log(`\nJARVIS v6 — backend cerebro ouvindo em http://localhost:${PORTA}`);
  console.log(`  GET  /saude`);
  console.log(`  POST /perguntar   body: { "pergunta": "..." }`);
  if (!chaveConfigurada()) {
    console.log('\n[!] Aviso: a chave da API ainda nao esta no backend/.env\n');
  }
});
