// Fonte única do catálogo demonstrativo do frontend.
// Quando o contrato da API Java estiver definido, esta será a camada a substituir.
window.ICEGEN = window.ICEGEN || {};
window.ICEGEN.products = [
  { id: "corrente-veneziana", name: "Corrente Veneziana 45 cm", category: "corrente", categoryLabel: "Colar", price: 189, image: "/assets/corrente-1.png", material: "Prata 925", measurement: "45 cm", description: "A malha veneziana é discreta e funciona bem sozinha. Para usar em camadas, combine com outra corrente ou com um pingente." },
  { id: "corrente-cartier", name: "Corrente Elo Cartier 60 cm", category: "corrente", categoryLabel: "Colar", price: 249, image: "/assets/cartier-1.png", material: "Prata 925", measurement: "60 cm", description: "Os elos deixam a corrente mais aparente. Use sobre uma camiseta ou combine com uma corrente mais curta." },
  { id: "pingente-luz", name: "Pingente Ponto de Luz", category: "pingente", categoryLabel: "Pingente", price: 119, image: "/assets/pingente-1.png", material: "Prata 925", description: "Um ponto de brilho para usar com uma corrente fina. Fica bem sozinho ou junto de um colar mais curto." },
  { id: "pingente-coracao", name: "Pingente Coração", category: "pingente", categoryLabel: "Pingente", price: 99, image: "/assets/coracao-1.png", material: "Prata 925", description: "O formato de coração funciona com correntes finas e pode ser usado sozinho ou em uma composição de colares." },
  { id: "brinco-argola", name: "Brinco Argola Fina", category: "brinco", categoryLabel: "Brinco", price: 139, image: "/assets/brinco-1.png", material: "Prata 925", description: "Uma argola para o dia a dia. Com o cabelo preso, o formato fica mais aparente; com outras peças, entra bem numa composição." },
  { id: "brinco-gota", name: "Brinco Gota", category: "brinco", categoryLabel: "Brinco", price: 159, image: "/assets/gota-1.png", material: "Prata 925", description: "O formato alongado aparece mais com o cabelo preso. Use com uma roupa de linhas simples ou combine com uma argola pequena." },
  { id: "pulseira-riviera", name: "Pulseira Riviera Prata", category: "pulseira", categoryLabel: "Pulseira", price: 219, image: "/assets/pulseira-1.png", material: "Prata 925", description: "Uma linha contínua de brilho para usar sozinha ou ao lado do relógio. Combine com outras pulseiras se preferir sobreposição." },
  { id: "pulseira-elo", name: "Pulseira Elo Português", category: "pulseira", categoryLabel: "Pulseira", price: 179, image: "/assets/elo-1.png", material: "Prata 925", description: "Os elos deixam a pulseira mais visível no pulso. Use sozinha ou ao lado de uma pulseira mais fina." },
  { id: "anel-liso", name: "Anel Liso", category: "anel", categoryLabel: "Anel", price: 149, image: "/assets/anel-1.png", material: "Prata 925", description: "Um aro liso que funciona sozinho ou junto de outros anéis. Se quiser sobrepor, combine larguras diferentes." },
  { id: "alianca-classica", name: "Aliança Clássica 4 mm", category: "alianca", categoryLabel: "Aliança", price: 199, image: "/assets/alianca-1.png", material: "Prata 925", measurement: "4 mm", description: "Uma aliança de linhas simples para usar sozinha ou com outro anel. Confira o aro antes de escolher o tamanho." }
];
window.ICEGEN.complements = {
  corrente: ["pingente"], pingente: ["corrente", "pulseira"], brinco: ["brinco"],
  pulseira: ["pingente"], anel: ["alianca"], alianca: ["anel"]
};
