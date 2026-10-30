# Direção visual editorial — 30/10/2026

## Referência e resultado

O proprietário pediu um front mais elaborado, com animações e acabamento em todas as seções, usando [PTZ Joias](https://ptzjoias.com.br) como inspiração. A abertura da referência foi examinada no navegador: fotografia escura em destaque, títulos grandes, contraste entre tipografia condensada e serifada, navegação espaçada e CTA contornado.

A composição foi recriada com identidade ICE GEN: prata, preto mineral, azul gelo e superfícies claras para comparar peças. Não foram copiados logotipo, fotografias, textos, depoimentos ou alegações comerciais da PTZ. O Figma original continua com o limite de acesso registrado em REFERENCIAS.md; esta revisão não alega leitura nova desse arquivo.

- Home: campanha com título em três ritmos, categorias em composição assimétrica, combinações com as duas peças reais dos dados, presentes, essência e chamada de atendimento.
- Catálogo: abertura fotográfica, busca e filtros mais claros, grade consistente e encerramento editorial.
- Produto: galeria quadrada, título forte, hierarquia de preço e compra, detalhes e complementos.
- Presentes: etapas escuras, seleção explícita, cartões com resposta visual, resumo e revisão.
- Sacola: itens arejados, resumo em azul escuro, complementos e estado vazio com identidade da marca.
- Favoritos: abertura editorial, cartões claros, estado vazio e chamada para continuar explorando.
- Cabeçalho e rodapé compartilhados: navegação fixa, estados de foco, diálogos refinados e assinatura tipográfica ICE GEN.

## Implementação e movimento

Os estilos estão em `dist/styles/visual.css`, `home-editorial.css` e `commerce-editorial.css`, carregados após os estilos anteriores. A fonte Barlow Condensed acompanha DM Sans e Playfair Display, com alternativas locais caso a fonte externa não carregue.

`dist/js/site-motion.js` usa IntersectionObserver e Web Animations para entradas curtas, pequenos intervalos entre cartões e resposta dos contadores. Cartões inseridos dinamicamente também são registrados. A identidade do item evita repetir a entrada a cada mudança de quantidade ou favorito. Não há rolagem controlada por JavaScript, cursor personalizado ou animação contínua.

O conteúdo fica visível por padrão. A preferência `prefers-reduced-motion` evita as entradas e cancela animações ativas; foco de teclado também cancela a animação de seu ancestral. Transições CSS respeitam movimento reduzido. A revisão dessa preferência foi feita no código; não se alterou a configuração do sistema operacional do proprietário.

A nova composição `editorial-silver-v2.webp` é arte de campanha ilustrativa, sem associação a um SKU. O arquivo original, a procedência e o prompt estão em [IMAGEM-EDITORIAL-V2.md](IMAGEM-EDITORIAL-V2.md). Os dados e as ilustrações provisórias do catálogo foram mantidos; fotografias oficiais continuam pendentes.

## Preservação

Antes desta revisão, a origem do Sites estava à frente da cópia local. A atualização foi conciliada por avanço direto, guardando e reaplicando as três alterações locais de produto: normalização da quantidade, altura dos complementos e tamanho do zoom, além de sua documentação. Nenhuma alteração do projeto antigo foi necessária.

Busca, filtros, favoritos, persistência, preços em centavos, variantes, sacola, presentes agrupados, edição e consulta pelo WhatsApp foram preservados. O número oficial confirmado permanece (11) 94860-8322. Não foram adicionados pagamento, conta de cliente, estoque, frete ou envio de mensagens automático.

## Validação

Conferência das seis páginas em larguras solicitadas ao navegador de 320, 768 e 1024 px: sem rolagem horizontal ou elementos ultrapassando a largura do documento. Com a barra de rolagem, as áreas úteis medidas foram 305, 753 e 1009 px. Também houve revisão visual em 390 e 1440 px.

No navegador foram conferidos: acesso Home → catálogo, filtro móvel de correntes, ficha, quantidade de duas unidades, favorito persistente, ampliação e retorno do foco com Escape, busca compartilhada por “coração”, montagem com três etapas explícitas e revisão, edição de embalagem e sacola. A corrente de R$ 189,00 em duas unidades totalizou R$ 378,00; o presente de R$ 347,00 passou a R$ 367,00 após trocar a embalagem, mantendo duas seleções na sacola e total de R$ 745,00. O painel de consulta abriu sem enviar mensagem. Escolhas criadas pelo teste foram removidas pela interface; estados vazios também foram conferidos.

Foram corrigidos no QA o cabeçalho fixo preso no contêiner e a grade das categorias em telas intermediárias. A galeria e os complementos continuam sem sobrepor o rodapé. A verificação estrutural passou com 26 arquivos JavaScript e 144 referências locais; os 64 testes automatizados passaram, sem falhas. O ZIP original manteve o SHA256 registrado no inventário. O acesso do Sites permanece privado para o proprietário.
