# ICE GEN V2

Reconstrução independente da interface da ICE GEN. Esta primeira entrega contém a Home responsiva para revisão. Catálogo completo, produto, montagem de presentes, sacola, favoritos e conta estão registrados para próximas etapas; não são fluxos completos desta prévia.

## Executar localmente

É necessário Node.js 20 ou superior. O projeto não usa dependências externas e não exige `npm install`.

```powershell
cd 'C:\Users\Nestu\OneDrive\Documentos\ChatGPT\ice gen V2\ice-gen-v2'
npm run dev
```

Abra [http://127.0.0.1:4173](http://127.0.0.1:4173). Encerre com `Ctrl+C`. O servidor escuta apenas no endereço local `127.0.0.1`; `PORT` pode substituir a porta padrão. Apenas a pasta `dist/` é servida. Caminhos externos, travessia de diretórios, arquivos ocultos e métodos diferentes de GET/HEAD são bloqueados. Arquivos usam tipo de conteúdo explícito e revalidação de cache.

## Verificar a estrutura

```powershell
npm run check
```

O comando verifica a sintaxe dos arquivos JavaScript, referências locais de HTML/CSS/JS, existência de assets e importação do catálogo com dez IDs únicos. Âncoras, fragmentos de sprites e destinos externos não são acessados. Não substitui a inspeção no navegador em desktop, celular, teclado e preferências de movimento reduzido.

## Estrutura

| Caminho | Finalidade |
| --- | --- |
| `dist/` | Arquivos públicos da Home e seus assets |
| `dist/data/` | Dados e configuração preservados, com metadados demonstrativos |
| `docs/INVENTARIO.md` | Inventário funcional, dados e regras do legado a preservar |
| `docs/REFERENCIAS.md` | Análise visual, fontes, assets e limites dos anexos |
| `docs/VALIDACAO-HOME.md` | Verificações da primeira Home e limites da revisão |
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

O contato WhatsApp vem do legado e ainda requer validação comercial. A prévia não processa pagamento, pedidos, entrega ou autenticação. Persistência local não equivale a conta ou sincronização entre aparelhos. A revisão e aprovação da Home antecedem a implementação das demais telas.
