// roteador.js — le a pergunta e decide DUAS coisas:
//   1) qual agente responde (analista, arquiteto, ou ambos)
//   2) a complexidade (simples -> modelo rapido; complexa -> modelo capaz)
//
// Usa o modelo rapido (Haiku) como classificador. Se a classificacao falhar por
// qualquer motivo, ha um plano B por palavras-chave para nunca travar.

import { conversar } from './anthropic.js';
import { MODELO_RAPIDO } from './config.js';

const SYSTEM_CLASSIFICADOR = [
  'Voce e um classificador de perguntas do sistema JARVIS.',
  'Dada a pergunta do usuario, responda APENAS com um JSON valido, sem texto extra,',
  'no formato: {"agente":"analista|arquiteto|ambos","complexidade":"simples|complexa"}.',
  'Use "analista" para pedidos de pesquisa, resumo ou levantamento de informacao.',
  'Use "arquiteto" para decisoes tecnicas, comparacoes e trade-offs (ex: "devo usar A ou B?").',
  'Use "ambos" so quando a tarefa claramente precisa pesquisar E decidir.',
  'Marque "complexa" quando exigir raciocinio, multiplas etapas ou comparacao profunda;',
  'caso contrario, "simples".',
].join(' ');

function planoBPorPalavras(pergunta) {
  const t = pergunta.toLowerCase();
  const pareceDecisao =
    /\b(devo|deveria|melhor|vs|versus|ou\b.*\bou\b|escolher|comparar|trade)/.test(
      t
    ) || t.includes(' ou ');
  const agente = pareceDecisao ? 'arquiteto' : 'analista';
  const complexidade =
    pergunta.length > 140 || pareceDecisao ? 'complexa' : 'simples';
  return { agente, complexidade, origem: 'plano-B (palavras-chave)' };
}

export async function rotear(pergunta) {
  try {
    const bruto = await conversar({
      modelo: MODELO_RAPIDO,
      system: SYSTEM_CLASSIFICADOR,
      pergunta,
      maxTokens: 100,
    });

    // Extrai o primeiro objeto JSON do texto, por seguranca.
    const inicio = bruto.indexOf('{');
    const fim = bruto.lastIndexOf('}');
    const json = JSON.parse(bruto.slice(inicio, fim + 1));

    const agente = ['analista', 'arquiteto', 'ambos'].includes(json.agente)
      ? json.agente
      : 'analista';
    const complexidade =
      json.complexidade === 'complexa' ? 'complexa' : 'simples';

    return { agente, complexidade, origem: 'classificador (Haiku)' };
  } catch {
    return planoBPorPalavras(pergunta);
  }
}
