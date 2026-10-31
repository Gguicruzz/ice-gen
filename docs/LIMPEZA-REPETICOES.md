# Redução de repetições — 31/10/2026

Sete ajustes aprovados pelo proprietário após a auditoria do front:

| Ponto | Resultado |
| --- | --- |
| Avisos de demonstração | Aviso geral curto por página, sem repetição no rodapé ou nota final do catálogo. Mantidas as indicações junto a preços/imagens e o esclarecimento antes da consulta pelo WhatsApp. |
| Descrição do produto | Resumo curto por produto junto ao preço; descrição completa apenas na aba Descrição. Metadados de busca, medidas e dados do catálogo preservados. |
| Favoritos | Banner promocional final removido. No estado vazio, apenas o botão central leva ao catálogo; o convite inicial reaparece quando há peças salvas. |
| Card de presentes na Home | Substituído pela categoria Pulseiras, com filtro funcional do catálogo e campanha ilustrativa original. A seção dedicada à montagem continua disponível. |
| Contato repetido | Bloco extra ao fim da Home e botão duplicado do rodapé removidos. Um único acesso de atendimento permanece no rodapé de todas as páginas. |
| Confirmações da montagem | Removidos o aviso persistente de escolha atualizada, a frase de escolha confirmada e mensagens redundantes de conclusão. A faixa mostra nome e valor da escolha. A revisão tem um único botão principal, na última etapa. Seleção, prévia, progresso, erros, validação de variantes e revisão antes de salvar continuam disponíveis. |
| Slogan duplicado | Mantida apenas a assinatura grande do rodapé. Copyright visível também no celular; regra antiga que esconderia o último texto foi retirada. |

A imagem nova de Pulseiras é ilustrativa e não representa um SKU oficial. O original, o WebP e o prompt estão registrados em [IMAGEM-PULSEIRAS.md](IMAGEM-PULSEIRAS.md). Nenhum arquivo do projeto antigo ou modelo de preço/persistência foi alterado.

## Verificações

- `npm run check`: 26 arquivos JavaScript e 145 referências locais válidos; catálogo com dez IDs únicos.
- `npm test`: 64 testes aprovados, sem falhas.
- As seis páginas foram conferidas em 320 e 1395 px; áreas úteis de 305 e 1380 px. Sem rolagem horizontal, um botão de contato e uma ocorrência visual do slogan no rodapé em cada página.
- O card Pulseiras abriu o catálogo filtrado com as duas peças cadastradas.
- A descrição completa da Pulseira Riviera apareceu uma vez, com resumo distinto junto ao preço. Favoritar, remover e alternar entre lista preenchida/vazia preservou foco e chamadas correspondentes.
- Na montagem, seleção por cartão e teclado, três etapas, total de R$ 347,00, único botão de revisão e gravação na sacola foram conferidos. Mensagens visuais redundantes de seleção permaneceram vazias. A consulta pelo WhatsApp abriu apenas o rascunho; nenhuma mensagem foi enviada. O item criado no teste local foi removido, sem alterar a sacola da origem publicada.

As animações existentes foram mantidas. O acesso privado do Sites continua restrito ao proprietário.
