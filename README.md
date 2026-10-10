# ICE GEN

Loja virtual de joias em prata 925 com frontend em HTML, CSS e JavaScript puro.

## Frontend hoje

- Homepage com carrossel, catálogo e filtros por categoria;
- Favoritos e sacola demonstrativos no navegador (`localStorage`);
- Página individual de produto;
- Sugestões de combinações e montagem de presentes;
- Servidor Node simples para servir os arquivos estáticos em `public/`.

O catálogo e os preços atuais são dados provisórios centralizados em `public/catalog.js`, usados pela homepage e pela página individual do produto. Login e persistência de sacola são demonstrativos; o botão de finalização apenas prepara uma mensagem para o WhatsApp, sem processar pagamento ou consultar estoque.

## Imagens do catálogo

Os ativos em `public/assets/` incluem ilustrações esquemáticas provisórias e a identidade visual da marca. As imagens de produtos aparecem identificadas como ilustrativas. O mapa de arquivos e as instruções de substituição ficam em [`public/assets/README.md`](public/assets/README.md).

## Backend

O backend Java está em desenvolvimento e ainda não possui integração com este frontend. Nenhum endpoint ou formato de API foi presumido. Quando o contrato da API estiver definido, a fonte de catálogo local poderá ser conectada a produtos e preços; login, usuários e pedidos continuam sem integração e dependem dos endpoints e regras do backend.

## Executar o frontend

```sh
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Desenvolvedor

**Guilherme Cruz Alves**

GitHub: https://github.com/Gguicruzz  
LinkedIn: https://www.linkedin.com/in/guilherme-cruz-alves-9a864334a/
