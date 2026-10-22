# Validação da primeira Home

Revisão em 21/10/2026. Escopo: Home, navegação entre suas seções, menu, busca e janelas de prévia. Não declara prontas as futuras páginas de catálogo/produto nem os fluxos de presentes/sacola/favoritos/conta.

## Verificações

- `npm run check`: sintaxe dos cinco JS válidos, 27 referências locais existentes, catálogo ESM com dez IDs únicos.
- HTTP local: Home retorna 200; servidor validado com tipos de conteúdo, HEAD/ETag e bloqueio de caminhos externos, arquivos ocultos e métodos não suportados.
- Navegador: revisão visual em 1440 × 1000, 768 × 1024 e 390 × 844. Sem conteúdo causando rolagem horizontal ou imagens quebradas. Hero, imagens de categorias, tipografia, montagem editorial e rodapé conferidos nas três larguras.
- Console do navegador sem erros ou avisos nos fluxos executados.
- Abertura de prévia do catálogo a partir da Home: dez produtos e preços do legado, explicitamente demonstrativos.
- Busca “colar” e “colares”: encontra correntes. “alianca”: encontra Alianças, ignorando acentos. Busca sem correspondência mostra estado vazio.
- Busca → categoria: conteúdo atualizado e foco reposicionado no título da janela.
- Menu móvel: abrir/fechar, navegação, favoritos e conta. Escape fecha a janela; o foco retorna ao botão de menu quando o acionador original ficou oculto.
- Sacola e conta têm nomes acessíveis independentes do texto oculto no celular. Ícones e categorias têm alvos mínimos de 44 px.
- Diálogos usam o elemento nativo `dialog`, com fundo inerte e fechamento por botão/Escape; acionadores recuperam o foco.
- Preferência de movimento reduzido: CSS remove transições e rolagem suave; não há autoplay nesta Home. A regra foi inspecionada no código; a emulação dessa preferência não foi executada pelo navegador disponível.

## Preservação

A suíte do legado foi executada em cópia isolada: 153/153 casos e 886 verificações, sem falhas. Isso comprova o estado auditado do legado, não a reconstrução dos fluxos futuros na V2. Hash do ZIP original registrado em `INVENTARIO.md`.

## Limitações conhecidas

Figma bloqueado pelo limite do plano Starter do MCP. O pacote de Sacola/Favoritos está truncado, com onze entradas completas recuperadas. As fotografias editoriais e as ilustrações/preços do catálogo são demonstrativos. O contato comercial ainda depende de validação. Fontes Google são carregadas externamente, com alternativas locais de serifada/sans-serif.

## Parte 1 — revisão da Home

Revisão adicional solicitada em 21/10/2026, limitada à primeira tela:

- Mantida a direção editorial e a prioridade de peças e acesso ao catálogo. Não foram criadas outras páginas.
- Corrigido o enquadramento do tríptico: a proporção original das joias foi preservada; o CSS recorta o excesso sem esticar as fotografias. Cards quadrados em celular/intermediário e tratamento próprio da imagem de presentes.
- Aumentadas legendas, avisos e textos úteis no celular. Contraste reforçado atrás das legendas dos cards. Categorias organizadas em três colunas e duas linhas, com alvos de 44 px.
- Removida a seta de submenu do link “Joias”. O marcador da navegação acompanha a seção e usa `aria-current="location"`. O contato recebe o marcador também no fim da página.
- Ao navegar pelo menu móvel usando Enter, o menu fecha e o foco segue para a seção escolhida. Fechar a prévia de uma categoria devolve o foco ao card que a abriu.
- Simplificados os textos dos diálogos, retirando referências técnicas ao código anterior. Avisos de demonstração e indisponibilidade permanecem explícitos. O contato não presume uma data de abertura da loja.
- Geradas versões WebP para entrega no navegador, sem substituir os PNGs originais nem alterar dimensões: hero 159.574 bytes e editorial 338.602 bytes. Juntas, 498.176 bytes, aproximadamente 91% menores que os 5.446.712 bytes dos PNGs.
- `npm run check`: cinco arquivos JS válidos, 28 referências locais existentes e dez IDs de catálogo únicos.
- Navegador: 320, 390, 768 e 1440 px revisados, sem rolagem horizontal ou imagens quebradas. Em 320 px os botões do hero passam a uma coluna. Busca “colares”, menu por teclado, prévia por categoria, retorno do foco, contato e marcador de seção conferidos. Console sem erros ou avisos nos fluxos executados. Capturas da revisão estão em `previews/revisao-home-desktop.jpg`, `previews/revisao-home-mobile.jpg` e `previews/revisao-joias-mobile.jpg` (artefatos locais, fora da publicação).

A revisão técnica e visual da Home está concluída. As validações comerciais e a decisão do usuário sobre o visual continuam distintas desta revisão; catálogo completo, produto e fluxos de compra permanecem para as etapas seguintes.
