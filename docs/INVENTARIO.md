# ICE GEN — inventário do legado e preservação funcional

Auditoria realizada em 21/10/2026, antes da reconstrução da interface. Esta etapa entrega somente a Home responsiva para revisão; catálogo completo, ficha de produto, presentes, sacola e conta ficam registrados para as próximas etapas.

## Fontes e preservação do original

- Projeto principal: `C:\Users\Nestu\OneDrive\Documentos\ice gen (5).zip`, raiz interna `ice gen/`.
- Não havia pasta `ice-gen-antigo` no workspace nem entre as pastas de primeiro nível de `Documentos\ChatGPT` no início da auditoria. O ZIP principal foi usado como fonte disponível. Nenhum arquivo do ZIP foi alterado.
- O conteúdo de aplicação e testes foi copiado para `.audit-legacy/`, dentro do workspace, excluindo integralmente a pasta `.git` do arquivo. A cópia foi usada para leitura e execução dos testes. Nenhum comando de instalação ou teste foi executado no original.
- SHA-256 do ZIP original: `3B52CC1D203308BF652619524D51E2E94B7F536CD4CFC171A3E70B485963B65C`.
- Arquivos do pacote de sacola/favoritos e direção visual são analisados separadamente. `ICE_GEN_Sacola_Favoritos.zip` não abre pelo leitor ZIP padrão porque falta o diretório central; seus arquivos completos recuperáveis devem ser tratados como referências, sem presumir que seus fluxos já existem no legado.
- Figma, imagens e textos anexados orientam o redesign. Nomes, preços, avaliações, promessas comerciais e integrações desenhadas nas referências não substituem os dados efetivamente presentes no código.

## Stack e execução verificadas

O legado é uma loja demonstrativa em HTML, CSS e JavaScript puro, sem dependências npm. `server.js` entrega apenas arquivos estáticos de `public/`, com proteção de caminho e suporte a formatos de fotografia. `package.json` oferece `npm run dev`, `npm test` e geração de ilustrações via PowerShell. A porta padrão é 3000 e pode ser substituída por `PORT`.

Não há aplicação Java, endpoint de API, banco, autenticação real, estoque ou processamento de pagamento dentro do pacote. O README menciona backend Java em desenvolvimento, ainda sem integração. Não foi encontrado `fetch`, XMLHttpRequest ou biblioteca de chamadas de API no frontend.

| Arquivo legado | Responsabilidade |
| --- | --- |
| `public/index.html` | Home, catálogo embutido, montagem de presentes, sobre, rodapé e diálogos |
| `public/catalog.js` | Fonte única dos 10 produtos, preços, complementos e propostas de combinações |
| `public/store.js` | Normalização e persistência de sacola/favoritos, quantidades e cálculos em centavos |
| `public/navigation.js` | Menu desktop/mobile, busca e navegação compartilhada |
| `public/app.js` | Home, carrossel, filtros, favoritos, presentes, sacola e conta demonstrativa |
| `public/produto.html` / `produto.js` | Ficha individual, galeria, quantidade, compartilhamento e complementos |
| `public/styles.css` | Estilos compartilhados acumulados |
| `public/home.css`, `cart.css`, `gift.css`, `product.css` | Refinamentos por área |
| `public/assets/` | 39 arquivos: identidade, ilustrações e documentação; inclui duplicatas |
| `server.js` | Servidor estático local |
| `tests/` | Nove suítes de regressão, DOM simulado e testes HTTP reais do servidor |

## Páginas, rotas e estados existentes

| Entrada | Comportamento confirmado |
| --- | --- |
| `/` e `/index.html` | Uma página com seções `#inicio`, `#colecoes`, `#produtos`, `#presentes`, `#sobre` e `#atendimento` |
| `/produto.html?id=<id>` | Ficha gerada a partir do catálogo; ID ausente/inválido mostra estado “Não encontramos essa peça” |
| `/?categoria=<categoria>#produtos` | Filtra categoria válida |
| `/?busca=<termo>#produtos` | Aplica busca ao catálogo |
| `/?favoritos=1#produtos` | Exibe peças salvas |
| `/?sacola=1` | Abre a sacola e limpa o parâmetro após consumir a ação |
| `/?conta=1` | Abre o diálogo demonstrativo de conta e limpa o parâmetro |

Não existem páginas independentes de catálogo, favoritos, sacola, checkout, entrega, trocas ou política de privacidade no pacote principal. “Sobre” e contato são trechos da Home. O redesign pode reorganizar essas áreas, mas deve registrar a migração de rotas quando elas forem implementadas.

## Matriz de funcionalidades a preservar

“Preservar” nesta matriz significa manter o comportamento nas etapas correspondentes da V2, respeitando a revisão da Home antes de avançar. Não significa reconstruir todas as telas na primeira entrega.

| Área | Comportamento real do legado | Decisão para V2 |
| --- | --- | --- |
| Marca e navegação | Logo, início, joias, sobre, contato, busca, favoritos, conta e sacola | Preservar hierarquia e acessos; reconstruir apresentação responsiva |
| Menu desktop/mobile | Categorias do catálogo, atalhos, fechamento externo/Escape, foco e adaptação a 700 px | Preservar interação e acessibilidade no novo cabeçalho |
| Home | Quatro slides com texto, imagem, CTA e navegação anterior/próxima | Preservar mensagem da marca e controles onde houver carrossel; Home da V2 prioriza peças e acesso rápido ao catálogo |
| Movimento | Autoplay de 6,5 s; pausa por hover, foco, aba oculta e preferência de movimento reduzido; botão de reprodução | Preservar os cuidados caso a V2 use autoplay |
| Combinações | Três propostas editoriais que abrem a peça principal | Preservar composição e ligação entre produtos; peças vendidas separadamente, sem kit/desconto implícito |
| Catálogo | Categoria única, busca, favoritos, destaques, menor/maior preço, contagem e limpar filtros | Preservar na etapa de catálogo; filtros por material/preço, novidades ou “mais vendidos” dos mockups ainda não existem |
| URL de catálogo | Categoria, busca e favoritos sincronizados com query string | Preservar compartilhamento/retorno de estado; ordenação não é persistida em URL no legado |
| Busca | Nome e categoria; ignora acentos/caixa, aceita aliases como colar/colares, até cinco sugestões | Preservar; resultado único abre produto, múltiplos/zero levam ao catálogo com termo |
| Favoritos | IDs locais, toggle no card e ficha, contador, filtro e estado vazio | Preservar dados e feedback; não há sincronização com conta ou servidor |
| Produto | Breadcrumb, material, descrição, preço, quantidade, subtotal, galeria opcional e ampliação | Preservar com dados preenchidos; não inventar medidas, fotos extras, variantes ou avaliações |
| Complementos | Até três peças por categoria relacionada, seleção múltipla e subtotal antes de adicionar | Preservar regras; recomendações não equivalem a kit e não incluem automaticamente a peça principal |
| Compartilhar | API nativa de compartilhamento, com fallback de cópia do link | Preservar na ficha |
| Sacola | Drawer, unidades, subtotal por linha, total, remoção, continuar comprando, vazio e feedback | Preservar; produtos iguais somam quantidade, presentes são registros independentes |
| Sugestões na sacola | Até três complementos, evitando itens já presentes e distribuindo categorias | Preservar com opção de ocultar/mostrar |
| Presentes | Escolha progressiva corrente → pingente → embalagem, resumo, subtotal e total | Preservar após revisão da Home; só permite adicionar com três escolhas válidas |
| Editar presente | Edição, cancelamento e validação contra alteração/remoção concorrente | Preservar estrutura `giftComponents` e quantidade original na edição |
| Finalização | Abre WhatsApp com seleção, unidades, componentes de presentes e total | Preservar como atendimento; não confirma compra e não envia mensagem automaticamente |
| Conta | Formulário explicitamente demonstrativo; limpa senha e informa indisponibilidade | Manter acesso transparente até existir backend; não simular sessão autenticada |
| Armazenamento | Leitura segura, normalização, erros de gravação e eventos entre páginas/abas | Reaproveitar regras comprovadas em módulo separado; avaliar compatibilidade das chaves antes de migrar |
| Acessibilidade | Skip link, nomes acessíveis, `aria-live`, foco em diálogos, Escape, fundo inert e movimento reduzido | Preservar como requisitos da interface reconstruída |

## Dados efetivos do catálogo

Todos os registros declaram `material: "Prata 925"`. Preços são os valores provisórios do código legado, não validação comercial ou confirmação de estoque. Nenhum registro cadastra avaliações, vendas, desconto, estoque, prazo de envio, variação de tamanho ou marketplace.

| ID estável | Produto | Categoria | Preço atual | Medida cadastrada |
| --- | --- | --- | --- | --- |
| `corrente-veneziana` | Corrente Veneziana 45 cm | `corrente` | R$ 189,00 | 45 cm |
| `corrente-cartier` | Corrente Elo Cartier 60 cm | `corrente` | R$ 249,00 | 60 cm |
| `pingente-luz` | Pingente Ponto de Luz | `pingente` | R$ 119,00 | — |
| `pingente-coracao` | Pingente Coração | `pingente` | R$ 99,00 | — |
| `brinco-argola` | Brinco Argola Fina | `brinco` | R$ 139,00 | — |
| `brinco-gota` | Brinco Gota | `brinco` | R$ 159,00 | — |
| `pulseira-riviera` | Pulseira Riviera Prata | `pulseira` | R$ 219,00 | — |
| `pulseira-elo` | Pulseira Elo Português | `pulseira` | R$ 179,00 | — |
| `anel-liso` | Anel Liso | `anel` | R$ 149,00 | — |
| `alianca-classica` | Aliança Clássica 4 mm | `alianca` | R$ 199,00 | 4 mm |

Campos opcionais que a ficha já aceita: `images`, `weight`, `clasp`, `finish`, `includedItems`, `care` e `imageIsIllustration`. Campos ausentes ficam ocultos. `measurement` é texto descritivo, não uma seleção de variantes. A orientação padrão de cuidado informa oxidação natural da prata, armazenamento seco e limpeza com flanela macia.

### Combinações e complementos

- Corrente → pingentes; pingente → correntes e pulseiras; brinco → outros brincos; pulseira → pingentes; anel → alianças; aliança → anéis.
- `camadas`: Corrente Veneziana + Pingente Ponto de Luz.
- `no-pulso`: Pulseira Riviera + Pingente Coração.
- `aros`: Anel Liso + Aliança Clássica.
- Presentes oferecem as duas correntes, os dois pingentes e duas embalagens: `wrap-paper` / “Embalagem 1” a R$ 39,00 e `wrap-velvet` / “Embalagem 2” a R$ 59,00. São opções provisórias, sem fotografia válida.

## Persistência e regras numéricas

- Chaves de `localStorage`: `icegen-cart` e `icegen-favorites`.
- Sacola armazena snapshots com ao menos `id`, `name`, `category`, `price` e `quantity`. Favoritos guardam IDs únicos e não vazios.
- Valores são convertidos para centavos inteiros, rejeitando preço negativo, não numérico, booleano ou vazio. Quantidades válidas são inteiros seguros maiores que zero; registros legados sem quantidade recebem 1.
- Totais e contadores protegem contra estouro de inteiros. Não existe limite baseado em estoque porque nenhum estoque foi cadastrado.
- Produtos comuns com mesmo ID se agrupam. Cada presente recebe um ID próprio e `giftComponents` com `kind`, ID, nome, preço e imagem aplicável das três escolhas.
- Gravação que falha não deve aparentar sucesso. Mudanças de `storage` e retorno via `pageshow` atualizam contadores e listas.
- Um presente salvo sem componentes válidos continua removível e com quantidade editável, mas não permite reconstruir/editar as escolhas.
- Edição de presente compara assinatura com o registro atual, evitando sobrescrever alterações concorrentes. Adição tem bloqueio temporário contra duplo clique.
- A V2 deve manter essa camada desacoplada da renderização. Não importar o CSS acumulado ou presumir uma API a partir dos nomes dessas funções.

## Integrações reais e lacunas

O único destino comercial externo do projeto principal é `https://wa.me/5511948608322` (11 94860-8322), usado para contato e abertura da mensagem de pedido. Esse número vem do código legado; os números, e-mails e redes desenhados nas referências não devem substituí-lo sem confirmação.

Não foram encontrados gateway de pagamento, frete, cálculo de CEP, pedidos persistidos, conta real, newsletter, avaliações, serviços de entrega/troca, analytics ou links de marketplace válidos. Não apresentar “envio em até 2 dias”, “troca em 7 dias”, nota 4,9/132 avaliações, best-sellers ou cupom como funcionalidades confirmadas apenas porque aparecem nos mockups.

## Assets reaproveitáveis e limitações verificadas

A identidade (`ice-gen-logo.png` e `ice-gen-logo-transparent.png`) pode ser reaproveitada. As imagens de produtos foram geradas pelo script legado como ilustrações esquemáticas; não são fotografias próprias das joias. A V2 pode usar linguagem editorial inspirada nas referências, mantendo clara a natureza ilustrativa dos produtos demonstrativos.

SHA-256 confirma duplicatas exatas que impedem tratar os arquivos como ângulos/peças diferentes:

- `corrente-1.png` = `cartier-1.png`; também há igualdade entre os respectivos `-2` e `-3`.
- `pulseira-1/2/3.png` = `elo-1/2/3.png` = `combo-pulseira.png`.
- `pingente-1/2/3.png` = `combo-corrente.png` = `gift-box.png`.
- `alianca-1/2/3.png` = `combo-alianca.png`.
- Cada trio `brinco-1/2/3.png`, `anel-1/2/3.png`, `coracao-1/2/3.png` e `gota-1/2/3.png` também é internamente idêntico.

`gift-box.png` representa um pingente, não uma embalagem. O legado já evita exibi-lo no configurador e mostra “Foto pendente”. Imagem ausente deve receber fallback neutro, nunca uma foto de outra peça. Fotografias, preços e produtos novos presentes nos mockups só entram no catálogo após confirmação específica.

## Validação do legado

Comando executado na cópia: `node .audit-legacy/tests/run.cjs`, Node `v24.14.0`.

| Suíte | Casos aprovados | Verificações |
| --- | --- | --- |
| storage | 10/10 | 43 |
| catalog | 8/8 | 189 |
| catalog-state | 12/12 | 85 |
| navigation | 31/31 | 89 |
| gift | 16/16 | 143 |
| cart | 13/13 | 56 |
| product | 30/30 | 141 |
| crosspage | 5/5 | 15 |
| server | 28/28 | 125 |
| **Total** | **153/153** | **886** |

Resultado: **0 falhas**. Testes de UI usam DOM simulado; servidor usa HTTP real em porta temporária. Não confirmam layout, contraste, recorte de imagens, navegação real ou responsividade, e não validam backend ou compra real. A Home reconstruída exige inspeção visual separada em desktop e celular.

### Migração de dados realizada para a prévia

Os módulos `dist/data/catalog.js` e `dist/data/config.js` foram criados a partir das fontes auditadas. O catálogo exporta `products`, `combinations`, `complements` e `catalogMetadata`. Foram preservados os dez registros, seus IDs, textos, medidas e preços; somente os caminhos de imagem passaram a `/assets/legacy/` e foram acrescentados `demonstration: true` e `imageIllustrative: true`. O metadado geral marca `commerciallyValidated: false`.

Foram copiados apenas os dez PNGs referenciados pelos produtos para `dist/assets/legacy/`. Comparação de hashes confirmou conteúdo idêntico aos assets originais. Comparação estruturada confirmou três combinações e seis relações de complemento sem alteração. A configuração pública exporta `whatsapp` e `siteConfig`, com `validated: false` no contato. Esses arquivos suportam a prévia demonstrativa sem criar páginas adicionais.

O hash do ZIP original foi conferido novamente após a exportação e permaneceu igual ao registrado no início da auditoria.

## Escopo da primeira entrega

1. Criar toda a nova implementação em `ice-gen-v2/` e manter o legado somente para leitura/referência.
2. Reaproveitar identidade, textos compatíveis, IDs, categorias, dados e regras que estejam corretos; separar dados, estado e componentes da interface.
3. Reconstruir Home com estética mineral escura, prata e fundo claro das referências, tipografia editorial e navegação responsiva.
4. Priorizar descoberta das peças e acesso rápido ao catálogo, conforme escolha do usuário.
5. Mostrar a Home revisável e registrar claramente os destinos que ainda pertencem a etapas futuras. Não apresentar interfaces e integrações pendentes como concluídas.
6. Aguardar a revisão dessa primeira tela antes de implementar as demais páginas e fluxos completos.
