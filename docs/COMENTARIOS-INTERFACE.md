# Ajustes dos comentários na interface — 24/10/2026

| Comentário | Alteração |
| --- | --- |
| Convite à coleção avulso | O convite faz parte do botão principal da campanha; o link flutuante foi retirado. |
| Cards dos conjuntos | Três cards com miniaturas; ao abrir, cada peça tem imagem, nome, preço e link individual, com soma informativa das duas peças. |
| Faixa de identidade | Fonte ampliada, estrelas azuis e quatro itens organizados em duas colunas no celular. |
| Lógica da montagem | Escolha permanece na etapa; avanço e retorno explícitos; resumo com ações de alterar; revisão antes de adicionar ou salvar edição; sucesso bloqueia adições repetidas até iniciar outro presente. |
| Harmonia do encerramento | Fundo escuro integrado à montagem e ao rodapé, com texto e ação alinhados e empilhamento no celular. |
| Sobre | Acesso retirado da navegação principal e do menu de celular. A seção de essência da Home continua disponível no rodapé. |
| Sacola vazia | Logo existente da ICE GEN no lugar do ícone genérico. |
| Busca pela lupa | Produtos durante a digitação, miniaturas, preços, categorias, contagem, limpeza e estado sem resultado. Pesquisa por nome, categoria, material e medida, com normalização de acentos e caixa. |
| Busca do catálogo | Painel azul claro, borda, título visível, botão escuro e destaque de foco. |

## Regras preservadas

As combinações editoriais usam produtos vendidos separadamente, sem desconto implícito. A soma mostrada corresponde às duas peças existentes no catálogo demonstrativo. Cada card leva à página individual.

A montagem mantém as três categorias e a persistência do rascunho. Revisar e fechar a janela não altera a sacola. Salvar edição mantém a identidade e a quantidade do grupo e conserva os demais itens. Dados corrompidos, variantes pendentes e falhas de gravação impedem a confirmação. Uma montagem salva exige iniciar outro presente para adicionar um novo grupo.

## Verificação

A checagem estrutural verifica sintaxe JavaScript, referências locais e os dez IDs do catálogo. A suíte agora tem 61 testes: os 56 anteriores e cinco casos para busca por material/medida, filtros combinados e validação do avanço/revisão com variantes e dados inválidos.

A revisão visual e dos cliques em navegador permanece pendente neste ambiente, cuja prévia foi bloqueada na tentativa anterior. Estes testes de modelo não confirmam a composição renderizada ou o comportamento do foco em um navegador real.

As fotos oficiais e as informações comerciais continuam pendentes de material validado.


## Composição da seção de essência

A seção final da Home passou a usar duas colunas: título editorial e chamada à coleção à esquerda, composição de prata sobre pedra escura à direita. O trecho “O resto é você” ganhou azul gelo e itálico; os três valores da marca têm uma linha própria. A imagem reutiliza o painel central da campanha existente, com a logo, marcação 925 e legenda de imagem ilustrativa. A composição se empilha abaixo de 760 px, e a ação leva diretamente ao catálogo.

Mudança restrita à apresentação e ao destino da chamada. Arquivos, sintaxe e referências locais foram verificados; os modelos de sacola, busca e montagem não foram alterados. A conferência em navegador permanece pendente no ambiente de prévia.


## Revisão da seleção de joias

Cada etapa agora usa opções de rádio nativas com rótulo cobrindo imagem e conteúdo do card. Só uma peça da categoria pode ficar selecionada. A escolha confirmada recebe destaque, e a indicação da peça atual aparece junto ao botão Continuar, acima dos cards. A área de ações acompanha a rolagem dentro da etapa. Até 1100 px, o resumo ocupa uma linha própria; no celular, os cards ficam em uma coluna para preservar nomes e controles legíveis.

Quando uma peça exige variante, a confirmação só ocorre após escolher uma opção válida. A seleção anterior permanece preservada no rascunho confirmado durante essa escolha; o resumo e o avanço tratam a peça pendente como incompleta. Voltar cancela a opção ainda não confirmada. Uma montagem completa restaurada inicia na última etapa para facilitar a revisão.

A suíte tem 64 testes aprovados, incluindo substituição de uma única joia, preservação dos outros componentes e validação de variantes. A checagem estrutural passou. A nova tentativa de prévia informou conexão recusada, apesar do supervisor em execução; o supervisor foi encerrado e a revisão visual segue pendente. Nenhuma infraestrutura alternativa foi usada.

## Escolher e montar o presente — 30/10/2026

Refino restrito ao montador marcado pelo proprietário. Os cartões ficaram mais compactos, com imagem e conteúdo lado a lado no celular. A indicação de escolha é um estado discreto; o rádio nativo e o contorno identificam a opção selecionada. “Ver detalhes” permite conferir descrição, material, medida e preço sem sair da montagem, e escolher a peça pela própria janela.

O avanço fica depois das opções, em uma faixa inferior dentro da área de escolha. Os botões indicam o destino: “Escolher pingente”, “Escolher embalagem” e “Revisar presente”. Cada etapa usa sua descrição específica e mostra quantas opções estão disponíveis. Selecionar continua sem avançar automaticamente.

O resumo ganhou uma prévia dos três componentes reais, progresso e detalhes expansíveis com valores e ação de alterar. As escolhas são exibidas lado a lado, sem simular uma fotografia da joia montada. O resumo começa recolhido e conserva a preferência ao redimensionar a tela; quando expandido, pode rolar normalmente. Variante e quantidade de cada componente continuam consideradas.

Verificação em navegador: seleção e troca pelo teclado, fechamento por Escape com retorno de foco, escolha pela janela de detalhes, avanço bloqueado sem escolha, prévia e soma de R$ 189,00 + R$ 119,00, revisão do presente de R$ 347,00 e fechamento sem gravar. A edição de embalagem foi revisada em R$ 367,00 e conservou o ID do presente e uma única seleção na sacola. Os itens criados no teste local foram removidos; o rascunho do site publicado foi preservado em sua origem.

Layouts conferidos em larguras de 320, 390, 740, 1024 e 1395 px, sem rolagem horizontal no montador. O botão mais longo foi conferido na menor largura. A janela de detalhes da embalagem também coube no celular pequeno. Sem erros de console observados. Checagem estrutural aprovada com 26 arquivos JS e 145 referências locais; 64 testes passaram. Os modelos e dados do catálogo não foram alterados.
