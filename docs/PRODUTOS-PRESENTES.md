# Partes 3 e 4 — produtos e montagem de presentes

Implementação em 22/10/2026. A parte 3 foi implementada e validada antes da interface da parte 4, conforme a sequência solicitada. Toda a alteração está em `ice-gen-v2`; os arquivos de origem permaneceram somente para leitura.

Atualização em 23/10/2026: o diálogo temporário de sacola descrito nesta entrega foi substituído por `/sacola.html`. Editar e salvar/cancelar um presente agora retorna à página completa da sacola. Favoritos e WhatsApp também foram integrados; ver `SACOLA-FAVORITOS-WHATSAPP.md`. As verificações abaixo registram a entrega original das partes 3 e 4.

## Parte 3: fichas individuais

- Cada um dos dez produtos tem URL própria em `/produto.html?id=<id>`, inclusive por acesso direto e recarga. Exemplo: `/produto.html?id=corrente-veneziana`. ID ausente/inválido apresenta estado vazio com retorno ao catálogo.
- Imagem, nome e ação dos cards do catálogo levam à ficha. Combinações da Home também abrem as peças. As relações de complementos continuam vindo de `catalog.js`.
- Galeria com a única ilustração efetivamente disponível, ampliação em diálogo nativo, descrição, material, medida cadastrada, cuidados, quantidade, favoritos, adição à sacola e link copiável para compartilhar a peça.
- Abas com setas, Home/End, estado selecionado e foco; Escape e fechamento da ampliação devolvem foco ao disparador.
- Quantidade inteira de 1 a 99, sem remoção implícita ao zerar. Avulsos iguais somam quantidade; opções diferentes, quando cadastradas, são linhas independentes. O limite de 99 é operacional, não uma informação de estoque.
- Não existem variantes comerciais cadastradas nos dez registros. A interface informa medidas ausentes; não inventa aros, tamanhos ou opções. A camada de seleção exige uma variante válida quando um produto possuir variantes cadastradas.

## Parte 4: presentes

- Rota `/presentes.html`; acessos pela Home, menu móvel e rodapé. Corrente → pingente → embalagem; etapas futuras dependem das anteriores.
- Selecionar avança; alterar uma escolha preserva as demais. Resumo e total parcial/completo são calculados a partir das escolhas reais em centavos.
- Duas correntes e dois pingentes do catálogo. Embalagens legadas demonstrativas: `wrap-paper` / “Embalagem 1” / R$ 39 e `wrap-velvet` / “Embalagem 2” / R$ 59. A imagem incorreta do legado não é exibida; ambos mostram fotografia pendente.
- As três escolhas são um único item `category: 'presente'`, com ID exclusivo e `giftComponents`. Presentes novos iguais continuam independentes. Variantes e quantidade de componentes são preservadas quando fornecidas; hoje as seleções novas são de uma unidade por componente.
- A sacola permite abrir `/presentes.html?editar=<id>`. Salvar substitui a linha conservando ID, quantidade mais recente e demais itens. Cancelar não grava e restaura o rascunho anterior.
- Antes de salvar, a sacola é relida. A assinatura `[name, price, giftComponents]` exclui quantidade e impede sobrescrever composição alterada/removida em outra aba. Presentes antigos incompletos continuam removíveis, sem oferecer edição inválida.
- Gravação é transacional. Falha não aparenta sucesso nem destrói o rascunho; permite repetir. A ação usa bloqueio contra cliques repetidos e estado de sucesso.
- Rascunho novo usa `sessionStorage` em `icegen-gift-draft-v2`, por aba. O rascunho de edição fica em memória, separado da sacola e do rascunho novo. A composição continua utilizável na página se a persistência do rascunho for bloqueada.
- No celular, detalhes do resumo iniciam recolhidos; total e ação ficam fora dessa área. O foco avança ao título da etapa ou à ação final visível. Cancelar e fechar a sacola devolvem foco ao título da montagem.

## Sacola necessária aos dois fluxos

Foi adicionada uma revisão compartilhada em diálogo com itens, componentes, quantidade, botão Atualizar, remoção, edição do presente, subtotal e estado vazio. A chave é a legada `icegen-cart`, independente de `icegen-favorites`. Mudanças entre abas atualizam o contador; cada mutação relê o armazenamento. Presentes são snapshots preservados; produtos avulsos usam os dados atuais do catálogo. Um subtotal inválido/maior que o limite seguro informa “A conferir”, sem mostrar zero como se fosse correto.

A tela completa de sacola/favoritos e suas funções adicionais pertencem à parte 5. Não há checkout, pagamento, frete, pedido, conta de cliente ou envio por WhatsApp nesta entrega. Valores e ilustrações continuam demonstrativos.

## Validação

- `npm run check`: 19 arquivos JS com sintaxe válida, 94 referências locais e dez IDs de produto únicos.
- `npm test`: 37 testes passaram, sendo 15 de catálogo/favoritos, 17 da sacola e 5 das etapas/rascunho de presente. Cobrem variantes exigidas quando cadastradas, limites e centavos, persistência/falha transacional, grupos independentes, edição sem duplicação, conflitos e compatibilidade legada.
- Navegador: produto e presentes em 320, 390, 768 e 1440 px, sem overflow horizontal nos estados verificados. Sem erros de JavaScript registrados nos fluxos executados.
- Produto: acesso pelo catálogo, recarga direta, ID inválido, quantidade 0 bloqueada, inclusão de 2 unidades de R$ 189 = R$ 378, atualização para 3 = R$ 567, remoção, favorito persistente, ampliação/Escape e aba Medidas.
- Presente: R$ 189 + R$ 119 + R$ 39 = R$ 347; duas unidades = R$ 694. Editar para embalagem de R$ 59 preservou o mesmo ID e duas unidades, com subtotal R$ 734. Cancelar uma troca posterior preservou essa composição e subtotal.
- Rascunho novo de R$ 387 foi restaurado após cancelar edição de outro presente; foco retornou ao título. Remover o presente em uma segunda aba durante edição impediu a gravação e a recriação do item.
- Resumo móvel recolhido, total e ação final visível após terceira escolha, acessos de cabeçalho/rodapé, cards e contador compartilhado conferidos. Screenshots locais em `previews/produto-desktop.jpg`, `produto-mobile.jpg`, `presentes-desktop.jpg` e `presentes-mobile.jpg` (não publicados no pacote).
- Bloqueio real de armazenamento no navegador não foi emulado; falhas e recuperação foram exercitadas com storage controlado nos testes de unidade. Não foi afirmada correspondência exata com o Figma, que continuou indisponível conforme registro em `REFERENCIAS.md`.
