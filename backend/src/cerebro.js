// cerebro.js — junta tudo: recebe uma pergunta, roteia para o(s) agente(s)
// certo(s) com o modelo certo, e devolve a resposta + quem respondeu + qual
// modelo foi usado. Esta e a porta de entrada do backend (usada pela CLI e pelo
// servidor HTTP).

import { conversar } from './anthropic.js';
import { AGENTES } from './agentes.js';
import { rotear } from './roteador.js';
import { MODELO_RAPIDO, MODELO_CAPAZ } from './config.js';

function modeloPara(complexidade) {
  return complexidade === 'complexa' ? MODELO_CAPAZ : MODELO_RAPIDO;
}

async function rodarAgente(idAgente, pergunta, modelo) {
  const agente = AGENTES[idAgente];
  const texto = await conversar({
    modelo,
    system: agente.system,
    pergunta,
    maxTokens: 2048,
  });
  return { agente: agente.nome, modelo, resposta: texto };
}

/**
 * Processa uma pergunta de ponta a ponta.
 * @param {string} pergunta
 * @returns {Promise<{pergunta, complexidade, origemRoteamento, respostas: Array}>}
 */
export async function pensar(pergunta) {
  const { agente, complexidade, origem } = await rotear(pergunta);
  const modelo = modeloPara(complexidade);

  let respostas;
  if (agente === 'ambos') {
    // Roda os dois agentes em paralelo (como pede a F0).
    respostas = await Promise.all([
      rodarAgente('analista', pergunta, modelo),
      rodarAgente('arquiteto', pergunta, modelo),
    ]);
  } else {
    respostas = [await rodarAgente(agente, pergunta, modelo)];
  }

  return {
    pergunta,
    complexidade,
    origemRoteamento: origem,
    respostas,
  };
}
