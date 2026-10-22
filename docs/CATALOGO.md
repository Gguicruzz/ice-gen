# Parte 2 — catálogo

Implementação em 22/10/2026. Esta entrega adiciona o catálogo completo à Home revisada. Produto individual, sacola, montagem e conta continuam nas próximas partes.

## Rotas e navegação

- `/catalogo.html`: dez produtos da fonte central, categorias e contagem de resultados.
- `busca`: busca por nome/categoria e aliases, ignorando acentos e caixa. Aceita termos combinados, como “colares veneziana”.
- `categoria`: filtro de uma ou mais categorias; parâmetros repetidos, por exemplo `?categoria=corrente&categoria=pingente`.
- `ordem`: `featured`, `price-asc`, `price-desc` ou `name`. A ordem padrão usa os registros do catálogo, sem alegar vendas, novidades ou avaliações.
- `favoritos=1`: restringe a seleção aos favoritos locais. Combina com busca e categorias.
- Voltar/avançar restaura os controles e os resultados. Atualizar ou abrir diretamente a URL preserva o estado.
- Links da Home, categorias, cards editoriais e busca levam ao catálogo. Cabeçalho, rodapé e diálogo agora usam `site-shell.js` e `site-ui.js` em ambas as páginas.

## Funcionalidades

- Categorias: correntes, pingentes, pulseiras, anéis, brincos e alianças. Contagens vêm dos registros efetivos.
- Remoção individual da seleção por chips e limpeza dos filtros; estado vazio com retorno às peças.
- Busca explícita por botão/Enter. Um rascunho ainda não enviado permanece no campo ao alterar filtros, ordenação ou favoritos.
- Em celular/tablet, o mesmo formulário de filtros passa para um diálogo nativo. A seleção atualiza os resultados e “Ver peças” fecha o diálogo. Escape mantém a seleção atual e devolve o foco ao botão Filtros.
- Cards permitem abrir uma prévia da peça com nome, preço, descrição e medida cadastrada. Isso não substitui uma URL própria de produto; nenhuma ficha individual é declarada pronta.
- Corações alternam favoritos; a seleção usa a chave legada `icegen-favorites`, com IDs válidos, deduplicação, leitura segura e atualização entre abas. Nenhuma chave da sacola é alterada.
- Se o navegador bloquear gravações, a seleção continua em memória e um aviso informa que ela não foi salva. Avisos dentro da prévia de uma peça ficam no próprio diálogo modal.
- Remover filtros e favoritos reposiciona o foco quando o controle acionado deixa de existir. Diálogos restauram o foco no card equivalente ou no título dos resultados.

## Dados e limites

Os dez produtos, valores, descrições, material e medidas foram preservados em `dist/data/catalog.js`. Nenhum preço, SKU ou avaliação dos mockups foi importado. As imagens de produto são os desenhos provisórios do legado, identificados como ilustrações. As fotografias editoriais são ilustrativas de campanha e não substituem fotografias comerciais de cada SKU.

Material é mostrado como informação, pois todos os registros têm o mesmo material. Não foram inventados filtros por estoque, avaliação, tamanho, novidade ou “mais vendidos”. Contato oficial, fotografias, preços e disponibilidade continuam sujeitos à confirmação. A prévia não realiza compra, pagamento ou pedido.

## Verificação

- `npm run check`: sintaxe, referências locais, assets e IDs do catálogo.
- `npm test`: 15 testes de busca, filtros combinados, ordenação numérica e estável, URL/valores inválidos, imutabilidade, favoritos, persistência, independência da sacola e falhas de armazenamento.
- Navegador: catálogo em 320, 390, 768 e 1440 px; sem rolagem horizontal, imagens quebradas ou erros de JavaScript nos fluxos executados.
- Verificados: categorias múltiplas + busca com acento; ordenação crescente; recarregar e voltar; estados vazios; favoritos após recarregar; remover favorito na prévia; busca não enviada preservada; remoção de chip por Enter; foco dos filtros móveis; Home ↔ catálogo e busca da Home por “colares”.
- Bloqueio real de armazenamento pelo navegador não foi emulado; o tratamento de falha foi testado em unidade. Fontes externas mantêm as alternativas locais definidas nos tokens.
