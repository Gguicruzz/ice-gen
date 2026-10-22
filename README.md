# ICE GEN V2

Reconstrução independente da interface da ICE GEN. Estão implementados Home, catálogo, páginas individuais dos dez produtos e montagem de presentes. Há busca, filtros, favoritos locais e uma sacola em diálogo para revisar produtos e presentes. As telas completas de sacola/favoritos, atendimento por WhatsApp e conta continuam pendentes.

## Executar localmente

É necessário Node.js 20 ou superior. O código e o servidor não exigem pacotes npm nem `npm install`. As fontes Google são externas, com alternativas locais.

```powershell
cd 'C:\Users\Nestu\OneDrive\Documentos\ChatGPT\ice gen V2\ice-gen-v2'
npm run dev
```

Abra [http://127.0.0.1:4173](http://127.0.0.1:4173). Encerre com `Ctrl+C`. O servidor escuta apenas no endereço local `127.0.0.1`; `PORT` pode substituir a porta padrão. Apenas a pasta `dist/` é servida. Caminhos externos, travessia de diretórios, arquivos ocultos e métodos diferentes de GET/HEAD são bloqueados. Arquivos usam tipo de conteúdo explícito e revalidação de cache.

O catálogo está em [http://127.0.0.1:4173/catalogo.html](http://127.0.0.1:4173/catalogo.html), os produtos em `/produto.html?id=<id>` e a montagem em `/presentes.html`. As páginas usam JavaScript para a navegação compartilhada e as interações; há aviso e retorno ao catálogo quando desativado.

## Verificar a estrutura

```powershell
npm run check
npm test
```

O comando verifica a sintaxe dos arquivos JavaScript, referências locais de HTML/CSS/JS, existência de assets e importação do catálogo com dez IDs únicos. Âncoras, fragmentos de sprites e destinos externos não são acessados. Não substitui a inspeção no navegador em desktop, celular, teclado e preferências de movimento reduzido.

`npm test` executa 37 testes de catálogo, favoritos, sacola e presentes com o runner nativo do Node. Funcionalidades e limites estão em [docs/CATALOGO.md](docs/CATALOGO.md) e [docs/PRODUTOS-PRESENTES.md](docs/PRODUTOS-PRESENTES.md).

## Estrutura

| Caminho | Finalidade |
| --- | --- |
| `dist/` | Home, catálogo, produtos, presentes e seus assets |
| `dist/data/` | Dados e configuração preservados, com metadados demonstrativos |
| `dist/js/site-shell.js` / `site-ui.js` | Cabeçalho, rodapé, menus, diálogos e feedback compartilhados |
| `dist/js/catalog-model.js` / `catalog-page.js` | Regras de busca/filtros/URL e apresentação do catálogo |
| `dist/js/favorites-store.js` | Favoritos locais com compatibilidade da chave legada |
| `dist/js/cart-store.js` | Sacola transacional, quantidades, centavos, variantes e grupos de presente |
| `dist/js/product-page.js` | Ficha individual, ampliação, quantidade, favoritos e complementos |
| `dist/js/gift-model.js` / `gift-page.js` | Etapas, rascunho, composição e edição de presentes |
| `tests/` | Regressões de catálogo, favoritos, sacola e presentes |
| `docs/INVENTARIO.md` | Inventário funcional, dados e regras do legado a preservar |
| `docs/REFERENCIAS.md` | Análise visual, fontes, assets e limites dos anexos |
| `docs/VALIDACAO-HOME.md` | Verificações da primeira Home e limites da revisão |
| `docs/CATALOGO.md` | Parte 2: funcionalidades, rotas, testes e limites |
| `docs/PRODUTOS-PRESENTES.md` | Partes 3 e 4: regras preservadas, rotas, testes e limites |
| `docs/PROMPT-IMAGEM.md` | Procedência, arquivo e prompt da campanha ilustrativa |
| `docs/inventario-sacola-favoritos.json` | Índice das entradas recuperáveis do ZIP de referências |
| `server.js` | Servidor estático local sem dependências |
| `scripts/check.mjs` | Verificações de estrutura e sintaxe |

## Fontes e preservação

O projeto anterior é somente referência. Como a pasta `ice-gen-antigo` não estava disponível no workspace no início da auditoria, o ZIP `ice gen (5).zip` foi a fonte efetivamente examinada; o inventário registra o hash e a validação da cópia de auditoria. Os arquivos de origem não foram alterados. Toda a nova implementação reside nesta pasta `ice-gen-v2`.

As quatro imagens anexadas orientam a linguagem editorial, a identidade mineral escura e as composições. O Figma informado não pôde ser lido: a chamada foi bloqueada pelo limite do plano Starter do MCP. A prévia não alega correspondência exata com camadas, componentes ou medidas do arquivo Figma.

O ZIP `ICE_GEN_Sacola_Favoritos.zip` está truncado. Onze entradas completas foram recuperadas e validadas por tamanho e CRC; o último SVG individual está incompleto. A especificação e a prancha geral recuperadas são referências para as próximas etapas.

## Imagens, dados e limites comerciais

O monograma de identidade foi reaproveitado do legado. As ilustrações legadas de produtos são provisórias; há arquivos duplicados entre peças e variantes, e eles não representam fotografias oficiais. `joias-editorial.png`, recuperada do pacote de referências, é uma imagem ilustrativa gerada por IA.

A imagem de campanha do hero foi gerada com a ferramenta ImageGen integrada ao Codex e está em `dist/assets/campaign-hero.png`. Trata-se de direção editorial para revisão visual; sua imagem não confirma o desenho, acabamento, disponibilidade ou composição de um produto real. A procedência e o prompt de geração estão registrados em [docs/PROMPT-IMAGEM.md](docs/PROMPT-IMAGEM.md).

A Home usa versões WebP de hero e editorial para reduzir o carregamento, preservando as dimensões e os PNGs originais. A revisão da primeira tela e seus testes de navegação estão em [docs/VALIDACAO-HOME.md](docs/VALIDACAO-HOME.md).

IDs, descrições e preços do catálogo foram preservados como dados demonstrativos do código legado. Não foram comercialmente validados. Os nomes e valores dos mockups não os substituem. Avaliações, estoque, frete, prazo de envio e outras promessas desenhadas nas imagens não são dados oficiais desta implementação.

O contato WhatsApp vem do legado e ainda requer validação comercial. A prévia não processa pagamento, pedidos, entrega ou conta de cliente. Persistência local não equivale a conta ou sincronização entre aparelhos. O acesso privado do Sites permanece restrito ao proprietário.
