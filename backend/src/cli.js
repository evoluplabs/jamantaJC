// cli.js — a forma mais simples do operador testar o cerebro.
// Uso:  node src/cli.js "sua pergunta aqui"
// Mostra: a resposta + qual agente respondeu + qual modelo foi usado.

import { pensar } from './cerebro.js';
import { chaveConfigurada } from './config.js';

function linha() {
  console.log('-'.repeat(60));
}

async function main() {
  const pergunta = process.argv.slice(2).join(' ').trim();

  if (!chaveConfigurada()) {
    console.error(
      '\n[!] Falta a chave da API. Crie o arquivo backend/.env com a linha:\n' +
        '    ANTHROPIC_API_KEY=sua-chave-aqui\n'
    );
    process.exit(1);
  }

  if (!pergunta) {
    console.error('\nUso: node src/cli.js "sua pergunta aqui"\n');
    process.exit(1);
  }

  console.log('\nPergunta: ' + pergunta);
  console.log('(pensando...)');

  try {
    const r = await pensar(pergunta);

    linha();
    console.log(
      `Roteamento: complexidade=${r.complexidade}  |  decisao via ${r.origemRoteamento}`
    );
    linha();

    for (const item of r.respostas) {
      console.log(`\n>> Respondido por ${item.agente}  (modelo: ${item.modelo})\n`);
      console.log(item.resposta);
    }
    console.log('');
    linha();
  } catch (erro) {
    console.error('\n[ERRO] ' + erro.message + '\n');
    process.exit(1);
  }
}

main();
