// Dados provisórios preservados do projeto original.
// As imagens são ilustrações; estes valores não confirmam preço ou disponibilidade comercial.
export const catalogMetadata = {
  "demonstration": true,
  "imageIllustrative": true,
  "commerciallyValidated": false,
  "source": "ice gen (5).zip / ice gen/public/catalog.js",
  "auditedOn": "2026-10-21"
};

export const products = [
  {
    "id": "corrente-veneziana",
    "name": "Corrente Veneziana 45 cm",
    "category": "corrente",
    "categoryLabel": "Colar",
    "price": 189,
    "image": "/assets/legacy/corrente-1.png",
    "material": "Prata 925",
    "measurement": "45 cm",
    "description": "A malha veneziana é discreta e funciona bem sozinha. Para usar em camadas, combine com outra corrente ou com um pingente.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "corrente-cartier",
    "name": "Corrente Elo Cartier 60 cm",
    "category": "corrente",
    "categoryLabel": "Colar",
    "price": 249,
    "image": "/assets/legacy/cartier-1.png",
    "material": "Prata 925",
    "measurement": "60 cm",
    "description": "Os elos deixam a corrente mais aparente. Use sobre uma camiseta ou combine com uma corrente mais curta.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "pingente-luz",
    "name": "Pingente Ponto de Luz",
    "category": "pingente",
    "categoryLabel": "Pingente",
    "price": 119,
    "image": "/assets/legacy/pingente-1.png",
    "material": "Prata 925",
    "description": "Um ponto de brilho para usar com uma corrente fina. Fica bem sozinho ou junto de um colar mais curto.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "pingente-coracao",
    "name": "Pingente Coração",
    "category": "pingente",
    "categoryLabel": "Pingente",
    "price": 99,
    "image": "/assets/legacy/coracao-1.png",
    "material": "Prata 925",
    "description": "O formato de coração funciona com correntes finas e pode ser usado sozinho ou em uma composição de colares.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "brinco-argola",
    "name": "Brinco Argola Fina",
    "category": "brinco",
    "categoryLabel": "Brinco",
    "price": 139,
    "image": "/assets/legacy/brinco-1.png",
    "material": "Prata 925",
    "description": "Uma argola para o dia a dia. Com o cabelo preso, o formato fica mais aparente; com outras peças, entra bem numa composição.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "brinco-gota",
    "name": "Brinco Gota",
    "category": "brinco",
    "categoryLabel": "Brinco",
    "price": 159,
    "image": "/assets/legacy/gota-1.png",
    "material": "Prata 925",
    "description": "O formato alongado aparece mais com o cabelo preso. Use com uma roupa de linhas simples ou combine com uma argola pequena.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "pulseira-riviera",
    "name": "Pulseira Riviera Prata",
    "category": "pulseira",
    "categoryLabel": "Pulseira",
    "price": 219,
    "image": "/assets/legacy/pulseira-1.png",
    "material": "Prata 925",
    "description": "Uma linha contínua de brilho para usar sozinha ou ao lado do relógio. Combine com outras pulseiras se preferir sobreposição.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "pulseira-elo",
    "name": "Pulseira Elo Português",
    "category": "pulseira",
    "categoryLabel": "Pulseira",
    "price": 179,
    "image": "/assets/legacy/elo-1.png",
    "material": "Prata 925",
    "description": "Os elos deixam a pulseira mais visível no pulso. Use sozinha ou ao lado de uma pulseira mais fina.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "anel-liso",
    "name": "Anel Liso",
    "category": "anel",
    "categoryLabel": "Anel",
    "price": 149,
    "image": "/assets/legacy/anel-1.png",
    "material": "Prata 925",
    "description": "Um aro liso que funciona sozinho ou junto de outros anéis. Se quiser sobrepor, combine larguras diferentes.",
    "demonstration": true,
    "imageIllustrative": true
  },
  {
    "id": "alianca-classica",
    "name": "Aliança Clássica 4 mm",
    "category": "alianca",
    "categoryLabel": "Aliança",
    "price": 199,
    "image": "/assets/legacy/alianca-1.png",
    "material": "Prata 925",
    "measurement": "4 mm",
    "description": "Uma aliança de linhas simples para usar sozinha ou com outro anel. Confira o aro antes de escolher o tamanho.",
    "demonstration": true,
    "imageIllustrative": true
  }
];

export const complements = {
  "corrente": [
    "pingente"
  ],
  "pingente": [
    "corrente",
    "pulseira"
  ],
  "brinco": [
    "brinco"
  ],
  "pulseira": [
    "pingente"
  ],
  "anel": [
    "alianca"
  ],
  "alianca": [
    "anel"
  ]
};

// Composições editoriais: produtos vendidos separadamente, sem desconto implícito.
export const combinations = [
  {
    "id": "camadas",
    "label": "01 / Camadas",
    "title": "Corrente + pingente",
    "description": "Escolha uma corrente e um pingente para usar juntos ou separados.",
    "productIds": [
      "corrente-veneziana",
      "pingente-luz"
    ]
  },
  {
    "id": "no-pulso",
    "label": "02 / No pulso",
    "title": "Pulseira + pingente",
    "description": "Veja a pulseira e explore os pingentes sugeridos para a composição.",
    "productIds": [
      "pulseira-riviera",
      "pingente-coracao"
    ]
  },
  {
    "id": "aros",
    "label": "03 / Aros",
    "title": "Anel + aliança",
    "description": "Compare os dois aros e escolha como quer usar cada um.",
    "productIds": [
      "anel-liso",
      "alianca-classica"
    ]
  }
];
