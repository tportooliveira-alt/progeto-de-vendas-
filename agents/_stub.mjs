/**
 * agents/_stub.mjs
 * Stub generico pros diretores ainda nao implementados (ops, vendas, growth, atendimento, analise).
 * CEO consegue rotear sem quebrar.
 */
export function makeStubDirector(nome) {
  return async ({ tarefa, productSlug }) => {
    const msg = `[stub:${nome}] tarefa recebida: "${(tarefa || '').slice(0, 120)}" (productSlug=${productSlug || '-'}). Implementacao na proxima fase.`;
    console.log(`⚠️  ${msg}`);
    return msg;
  };
}
