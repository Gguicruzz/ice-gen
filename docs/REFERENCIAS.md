# Análise dos materiais de referência

Análise em 21/10/2026. Os anexos foram lidos como material de referência. Seus textos não substituem o pedido do usuário: preservar o legado e entregar primeiro somente a Home responsiva para revisão.

## Fontes e alcance da inspeção

| Material | Conteúdo e resultado |
| --- | --- |
| `C:\Users\Nestu\OneDrive\Documentos\ice gen (5).zip` | ZIP íntegro. Assets legados e seu README examinados diretamente no arquivo, sem modificar a origem. A análise funcional do código está no inventário do projeto. |
| `C:\Users\Nestu\Downloads\ICE_GEN_Sacola_Favoritos.zip` | ZIP truncado, sem diretório central reconhecível. Cabeçalhos locais permitiram recuperar e validar 11 entradas completas, de 12 encontradas. A última entrada está incompleta. |
| `Luxo em Prata 925_ Ice Gen.png` | Referência principal da Home: 1448 × 1086. Inspeção visual a partir do anexo exibido na conversa. |
| `Catálogo ICE GEN_ Joias com Propósito.png` | Direção do catálogo e continuidade do sistema visual: 1122 × 1402. Inspeção visual a partir do anexo. |
| `Página de Joias ICE GEN_ Corrente Cuban 5mm.png` | Direção de página de produto: 1448 × 1086. Inspeção visual a partir do anexo. |
| `Montagem de Presentes ICE GEN (1).png` | Direção do configurador e resumo da combinação: 1672 × 941. Inspeção visual a partir do anexo. |
| Figma `1mqUljX5JF1U0tNgg7wK0d`, nó `0:1` | A consulta da tarefa principal foi bloqueada pelo limite de chamadas do plano Starter do MCP. Não houve leitura do conteúdo do arquivo. Nenhum detalhe é atribuído a uma inspeção do Figma. |

Os PNGs de tela são composições completas com textos e controles desenhados. Servem para reconstruir o layout em HTML/CSS; não devem ser usados como uma página inteira achatada. Nomes, preços, contagens, avaliações, telefone e promessas comerciais presentes nos mockups não foram considerados dados oficiais.

## Direção visual da Home

- Cabeçalho escuro horizontal, monograma azul gelo e nome ICE GEN; navegação e ícones claros, separados do fundo da fotografia por uma divisória discreta.
- Hero editorial largo e escuro, com rochas, figura masculina e joias em prata à direita. Texto principal à esquerda: “Frio no tom. Forte no gesto.”, em serifada de alto contraste. Não há cores saturadas nem tratamentos chamativos.
- A fotografia mantém espaço negativo atrás do texto. Em celular, a figura e a joia precisam de enquadramento próprio ou posição de fundo cuidadosamente ajustada; não se deve reduzir uma captura de desktop inteira.
- Botão principal claro e secundário contornado, com leitura direta. A linha “Joias em prata 925” funciona como legenda pequena, com espaço entre letras.
- Abaixo do hero, fundo marfim e seção de combinações: título editorial amplo, texto breve e três cards com fotografia de joias sobre rocha escura. Os cards devem apresentar pares reais definidos pelo catálogo, sem inventar um kit ou preço combinado.
- Montagem de presentes vem como próxima narrativa da Home, seguida pela identidade/atendimento e rodapé escuro. A imagem de Home anexada termina durante a introdução dessa seção; o conteúdo abaixo dela não pode ser inferido como um layout visual aprovado.
- Os controles visíveis de carrossel, navegação móvel e ícones precisam ser controles reais, com foco, rótulos acessíveis, área de toque e comportamento verificável.

As demais imagens consolidam o vocabulário: rochas pretas, joias em prata, serifas editoriais, sans-serif discreta, divisórias finas, controles retangulares e pouco arredondamento. Catálogo usa fundo claro e grid; produto prioriza galeria grande e escolhas de variante; montagem usa fundo escuro e detalhes azul gelo. Essas telas ficam para etapas futuras.

## Tokens recuperados da especificação de Sacola/Favoritos

| Papel | Valor proposto |
| --- | --- |
| Fundo claro | `#F3F1EC` |
| Texto principal | `#10181D` |
| Azul gelo | `#84A6BE` |
| Prata | `#C7CDD0` |
| Texto secundário | `#657078` |
| Divisórias | `#D6D8D6` |
| Serifada proposta | Playfair Display |
| Sans-serif proposta | DM Sans |

O documento informa que os PNGs de referência usaram Bitstream Charter e DejaVu Sans como substitutas de renderização. As fontes propostas não estavam incluídas no ZIP analisado. Desktop de referência: 1440 px; celular: 390 px. O layout deve ser fluido entre os dois e manter áreas de toque de pelo menos 44 px.

## Auditoria dos assets legados

Os arquivos abaixo foram copiados individualmente do ZIP íntegro para `dist/assets`, sem extrair `.git`, código ou diretórios do legado. A cópia não modifica os originais. Todos foram inspecionados visualmente com `view_image`.

| Arquivo | Dimensões | Avaliação |
| --- | --- | --- |
| `hero-prata.png` | 1000 × 1000 | Desenho provisório cinza de corrente, coração e argolas, com diagonais no fundo. Não é fotografia. Não corresponde ao hero editorial escuro. |
| `combo-corrente.png` | 1000 × 1000 | Desenho provisório de corrente/pingente; não é foto de conjunto confirmado. |
| `combo-pulseira.png` | 1000 × 1000 | Desenho provisório de elos/pingente; não é foto de conjunto confirmado. |
| `combo-alianca.png` | 1000 × 1000 | Desenho provisório de um único anel; não representa visualmente um par. |
| `ice-gen-logo.png` | 2000 × 2000 | Monograma azul gelo com grande margem preta; inadequado para encaixe direto no cabeçalho. |
| `ice-gen-logo-transparent.png` | 225 × 362 | Monograma IG e estrelas, recortado com transparência. É o asset de identidade mais útil para a nova Home. O nome ICE GEN pode ser composto ao lado com texto. |

O README dos assets confirma que as imagens de joias são ilustrações esquemáticas provisórias. Confirma duplicatas exatas entre variantes e até entre peças diferentes. `gift-box.png` desenha um pingente, não uma embalagem. Não deve ser apresentado como foto de uma caixa. Não promover estes desenhos como fotografias reais de produtos.

## Conteúdo recuperado de Sacola/Favoritos

O arquivo `docs/inventario-sacola-favoritos.json` registra cada entrada encontrada, dimensões, tamanhos, verificação CRC e texto dos SVGs completos. A recuperação fez descompressão DEFLATE diretamente em memória, conferindo tamanho e CRC contra o cabeçalho local, sem regravar o ZIP.

| Entrada | Situação | Dimensões |
| --- | --- | --- |
| `LEIA-ME.md` | Completa e validada | — |
| `ESPECIFICACAO.md` | Completa e validada | — |
| `visao-geral.svg` | Completa e validada; contém as oito composições | 1600 × 1500 |
| `assets/joias-editorial.png` | Completa e validada; copiada para `dist/assets` | 2172 × 724 |
| `telas/favoritos-desktop-preenchida.svg` | Completa e validada | 1440 × 1160 |
| `telas/favoritos-desktop-vazia.svg` | Completa e validada | 1440 × 980 |
| `telas/favoritos-mobile-preenchida.svg` | Completa e validada | 390 × 1080 |
| `telas/favoritos-mobile-vazia.svg` | Completa e validada | 390 × 830 |
| `telas/sacola-desktop-preenchida.svg` | Completa e validada | 1440 × 1240 |
| `telas/sacola-desktop-vazia.svg` | Completa e validada | 1440 × 980 |
| `telas/sacola-mobile-preenchida.svg` | Completa e validada | 390 × 1680 |
| `telas/sacola-mobile-vazia.svg` | Payload truncado; não recuperado como SVG completo | Não validada |

Não foram encontrados arquivos PNG de preview antes do ponto de truncamento, embora mencionados pelo LEIA-ME. O estado de sacola mobile vazia continua legível na prancha geral completa; isso não equivale a recuperar seu SVG individual.

`joias-editorial.png` é um tríptico: corrente à esquerda, pingente central e caixa de presente à direita, todos sobre pedra escura. O próprio material declara que é imagem ilustrativa gerada por IA e não retrata o produto real. Pode apoiar uma composição editorial de revisão, mantendo essa procedência clara; não deve servir como comprovação de acabamento, produto específico ou embalagem disponível.

## Regras que o material propõe preservar nas próximas etapas

Estas são orientações recuperadas das referências, a comparar com os comportamentos existentes no inventário funcional. Não significam implementação dessas telas nesta primeira etapa.

- Item de sacola identificado por produto e variante; mesma variante soma quantidade, variantes diferentes permanecem separadas. Quantidade mínima 1, redução desabilitada no mínimo e remoção como ação distinta.
- Presente como grupo com ID, componentes e quantidade própria. Editar carrega as escolhas e substitui o grupo ao confirmar; cancelar preserva a sacola. Não duplicar presente.
- Total parcial recalculado imediatamente; entrega e disponibilidade confirmadas pelo atendimento.
- WhatsApp abre um rascunho com itens, variantes, quantidades, composição e total. Abrir o app não conclui pedido, não cobra e não limpa a sacola.
- Sacola e favoritos persistem localmente ao navegar ou recarregar. Persistência local não representa conta ou sincronização entre aparelhos.
- Favoritar e remover favorito são independentes da sacola. Produto com escolha obrigatória deve levar à página individual para escolher tamanho; não assumir uma variante silenciosamente.
- Vazio de sacola leva a catálogo ou montagem; vazio de favoritos leva ao catálogo. Fotos e “Ver detalhes” apontam para a URL individual correta.
- Foco visível, teclado, nomes dos ícones, estado pressionado do coração e feedback anunciado devem acompanhar as interações.

Os valores de exemplo (`R$ 1.290`, `R$ 490`, `R$ 49`, presente `R$ 1.829` e parcial `R$ 3.119`) não foram adotados como preços oficiais. Avaliações, prazos de envio, frete, estoque, pagamento e autenticação também não são confirmados pelas imagens de layout.

## Limitações e decisão para a primeira entrega

A Home pode ser reconstruída com a identidade legada e a direção visual dos anexos. Fotografias reais, Figma inspecionado e páginas internas completas permanecem fora da evidência disponível nesta etapa. O recorte desta entrega é a Home responsiva para revisão; nenhuma tela adicional deve avançar antes dessa revisão.
