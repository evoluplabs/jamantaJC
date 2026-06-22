// anthropic.js — cliente minimo para a API da Anthropic, usando apenas o fetch
// nativo do Node (sem bibliotecas externas, R5). E aqui que toda a inteligencia
// pesada e chamada; a chave (R1) e lida do config e enviada apenas pelo backend.

import { CHAVE_ANTHROPIC, BASE_URL } from './config.js';

const VERSAO_API = '2023-06-01';

/**
 * Faz uma pergunta a um modelo da Anthropic e devolve o texto da resposta.
 *
 * @param {Object} opcoes
 * @param {string} opcoes.modelo        - id do modelo (ex: claude-opus-4-8)
 * @param {string} opcoes.system        - prompt de sistema (o "papel" do agente)
 * @param {string} opcoes.pergunta      - a mensagem do usuario
 * @param {number} [opcoes.maxTokens]   - limite de tamanho da resposta
 * @returns {Promise<string>} texto da resposta
 */
export async function conversar({ modelo, system, pergunta, maxTokens = 2048 }) {
  if (!CHAVE_ANTHROPIC) {
    throw new Error(
      'Chave da API da Anthropic ausente. Coloque ANTHROPIC_API_KEY no arquivo backend/.env'
    );
  }

  const resposta = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': CHAVE_ANTHROPIC,
      'anthropic-version': VERSAO_API,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: pergunta }],
    }),
  });

  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(
      `Erro da API (${resposta.status}): ${corpo.slice(0, 500)}`
    );
  }

  const dados = await resposta.json();
  // A resposta vem em blocos; juntamos o texto de todos os blocos de texto.
  const texto = (dados.content || [])
    .filter((bloco) => bloco.type === 'text')
    .map((bloco) => bloco.text)
    .join('\n')
    .trim();

  return texto;
}
