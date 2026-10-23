# Partes 5, 6 e 7

Implementação e revisão em 23/10/2026, em continuidade às partes anteriores. Alterações somente em `ice-gen-v2`. O arquivo de origem e a cópia de auditoria do legado permanecem somente para leitura.

## Parte 5: sacola e favoritos

`/sacola.html` e `/favoritos.html` são páginas próprias. Cabeçalho, rodapé, produtos e presentes apontam para essas rotas. As URLs antigas `/?sacola=1` e `/?favoritos=1` são encaminhadas às novas páginas. O filtro `catalogo.html?favoritos=1` continua válido.

A sacola usa fundo marfim, lista à esquerda e resumo escuro à direita; no celular, o conteúdo empilha. Há imagens ilustrativas, nome, medida/opção cadastrada, preço unitário, subtotal por linha, quantidade e remoção. Botões ± atualizam imediatamente os totais; mínimo 1 e limite operacional 99, sem remoção implícita ou alegação de estoque. Salvar/remover um favorito na linha não remove o item da sacola.

Presentes continuam como grupos exclusivos com componentes e quantidade própria. A quantidade repete todo o presente. Editar abre a montagem, conserva o ID e a quantidade atual ao salvar e retorna à sacola com foco no grupo. Cancelar mantém a composição original. Grupos antigos incompletos continuam removíveis e com quantidade editável, sem oferecer edição inválida.

O módulo puro `bag-model.js` preserva as sugestões do legado: até três complementos, uma categoria por vez antes de repetir, excluindo produtos avulsos/variantes e componentes de presentes já na sacola. A pessoa pode ocultar/mostrar sugestões durante a visita. Se adicionar a última opção disponível, o foco volta a um título visível.

Favoritos apresentam cards com imagem, informações, preço, ficha individual e remoção. Sem variante obrigatória, adicionar coloca uma unidade na sacola e mantém o favorito. Com variantes cadastradas, encaminha à ficha para escolher. Hoje o catálogo não contém variantes comerciais; não foram criados tamanhos fictícios. Remover o último favorito exibe o estado vazio e reposiciona o foco no título.

As chaves legadas continuam `icegen-cart` e `icegen-favorites`. Há atualização por `storage` e `pageshow`. A sacola só confirma mudanças depois de gravar. Favoritos mantêm seleção em memória se houver falha de gravação, com aviso; a reconciliação incorpora alterações de outras abas e mantém alterações locais pendentes. Remoção de favorito é idempotente e não volta a adicionar uma peça removida em outra aba.

## Parte 6: atendimento por WhatsApp

O proprietário confirmou explicitamente o WhatsApp **(11) 94860-8322** nesta conversa. `data/config.js` registra `validated: true` e a data da confirmação. Esse indicador registra a confirmação do proprietário, não uma verificação externa da conta no WhatsApp.

“Consultar pelo WhatsApp” abre um resumo revisável da sacola. O link de conversa usa o número internacional e `text` codificado, conforme a [documentação oficial do WhatsApp](https://faq.whatsapp.com/5913398998672934/?locale=pt_BR). A mensagem inclui nome, material, medida/opção quando registrados, quantidade, preço demonstrativo, subtotal e total parcial. Nos presentes, informa componentes, quantidade por presente e quantidade do grupo, sem contar componentes duas vezes no total.

O link abre em nova aba; a pessoa decide se envia a mensagem no WhatsApp. O site não envia automaticamente, confirma pedido, cobra ou limpa a sacola. Preços finais, disponibilidade e entrega continuam a confirmar no atendimento. O contato direto do rodapé abre o canal confirmado sem inventar e-mail ou prazo de resposta.

O modelo puro `createWhatsAppDraft` valida contato, quantidades, preços, inteiros seguros e composição/coerência do snapshot de presente. IDs antigos legíveis são aceitos sem trocar suas informações pelo catálogo atual. Dados incompletos impedem gerar uma mensagem enganosa. Há limite de campos/mensagem sem truncamento silencioso. Uma alteração da sacola em outra aba invalida a prévia aberta e exige atualizar o resumo antes de continuar.

## Parte 7: revisão e evidências

- `npm run check`: 25 arquivos JS com sintaxe válida, 128 referências locais existentes, dez IDs de produto únicos.
- `npm test`: 56 testes passaram: 10 catálogo, 7 favoritos, 17 sacola, 5 montagem, 8 sugestões e 9 WhatsApp.
- Sacola e favoritos conferidos em 320, 390, 768 e 1440 px, preenchidos e vazios. Sem rolagem horizontal nos estados observados. Sem imagens quebradas nas verificações realizadas. Modal de WhatsApp conferido em desktop e 390 px.
- Produto → sacola; favorito → adicionar sem remover favorito; remoção final → estado vazio/foco; atualização entre abas; quantidade mínima; sugestões e última sugestão; edição/cancelamento de presente; recarga, histórico, contato e navegação compartilhada conferidos.
- Cenário integrado: quatro correntes de R$ 189 = R$ 756; dois presentes de R$ 347 = R$ 694; edição da embalagem para R$ 59 levou o grupo a R$ 734 e o total a **R$ 1.490**. Nenhum grupo duplicado. Cancelar uma troca de corrente manteve as duas linhas e o total.
- Rascunho do WhatsApp conferido pelo texto e pela URL no DOM: destinatário confirmado, `target=_blank`, total de R$ 1.490, componentes e quantidades corretos. Uma adição em outra aba desativou o link antigo; “Atualizar resumo” recuperou os valores atuais. Escape retornou ao botão de consulta.
- Durante a revisão, foram corrigidos o foco após desaparecer a última sugestão, o estado `saving` antes de redirecionar uma edição e a perda de favoritos por gravações de duas abas sem evento `storage` intermediário.
- Capturas locais em `previews/sacola-desktop.jpg`, `sacola-mobile.jpg`, `favoritos-desktop.jpg`, `favoritos-mobile.jpg`, estados vazios e `whatsapp-resumo-desktop.jpg`/`whatsapp-resumo-mobile.jpg`. Não integram o pacote publicado.

Não houve envio de mensagem de teste nem conclusão de pedido. Falha de armazenamento, dados corrompidos, limites, variantes cadastradas em fixtures e conflitos foram exercitados com armazenamento controlado nos testes; bloqueio real de storage no navegador não foi emulado. A revisão usa o navegador embutido, sem alegar testes em aparelhos físicos, Safari ou Firefox. As fontes externas têm alternativas locais. O Figma continuou sem leitura confirmada; as referências e limites dos anexos estão documentados em `REFERENCIAS.md`.

Fotografias reais, medidas faltantes, preços e disponibilidade comerciais continuam pendentes. Não foram adicionados pagamento, frete automático, conta de cliente, avaliações fictícias ou garantias de envio desenhadas nos mockups. A publicação mantém o acesso privado do proprietário.
