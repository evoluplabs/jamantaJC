// config.js — carrega as variaveis de ambiente do arquivo .env (sem depender de
// nenhuma biblioteca externa, em respeito a regra R5).
//
// A unica configuracao sensivel e a chave da API da Anthropic (R1: a chave vive
// somente aqui no backend, dentro do .env, e nunca vai para o Git).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const caminhoEnv = join(aqui, '..', '.env');

// Le o .env (se existir) e coloca cada par CHAVE=VALOR no process.env,
// sem sobrescrever valores que ja venham do sistema.
function carregarEnv() {
  let conteudo;
  try {
    conteudo = readFileSync(caminhoEnv, 'utf8');
  } catch {
    return; // sem .env: seguimos com o que houver no ambiente
  }
  for (const linha of conteudo.split('\n')) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    const igual = limpa.indexOf('=');
    if (igual === -1) continue;
    const chave = limpa.slice(0, igual).trim();
    let valor = limpa.slice(igual + 1).trim();
    // remove aspas em volta do valor, se houver
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[chave] === undefined) {
      process.env[chave] = valor;
    }
  }
}

carregarEnv();

export const CHAVE_ANTHROPIC = process.env.ANTHROPIC_API_KEY || '';
export const BASE_URL =
  process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';

// Modelos vigentes da familia Claude (confirmados na documentacao da API).
// Pergunta simples -> modelo rapido. Pergunta complexa -> modelo capaz.
export const MODELO_RAPIDO = 'claude-haiku-4-5';
export const MODELO_CAPAZ = 'claude-opus-4-8';

export function chaveConfigurada() {
  return CHAVE_ANTHROPIC.trim().length > 0;
}
