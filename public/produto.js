const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const productCatalog = [
  { id: "corrente-veneziana", name: "Corrente Veneziana 45 cm", category: "Colar", price: 189, image: "https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946", description: "Uma corrente delicada que acompanha desde uma camisa aberta até um vestido de noite. Use sozinha ou com seu pingente favorito.", style: "Clássico e versátil" },
  { id: "corrente-cartier", name: "Corrente Elo Cartier 60 cm", category: "Colar", price: 249, image: "https://jorgerevilla.com/2748-ultralarge_default/sterling-silver-chain-45-cm.jpg", description: "Elos marcantes que valorizam produções básicas e urbanas. Experimente em camadas com uma corrente mais curta.", style: "Urbano e marcante" },
  { id: "pingente-luz", name: "Pingente Ponto de Luz", category: "Pingente", price: 119, image: "https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946", description: "Um brilho sutil para iluminar o colo. Fica especialmente bonito em uma corrente fina, com decote em V ou camisa aberta.", style: "Delicado e luminoso" },
  { id: "pingente-coracao", name: "Pingente Coração Polido", category: "Pingente", price: 99, image: "https://atraktivajoias.cdn.magazord.com.br/img/2024/09/produto/5246/pingente-coracao-prata-925.jpg?ims=fit-in%2F1200x1200%2Ffilters%3Afill%28white%29", description: "Um símbolo delicado que combina com correntes venezianas e looks de todos os dias. Também é uma escolha cheia de significado para presentear.", style: "Romântico e atemporal" },
  { id: "brinco-argola", name: "Brinco Argola Fina", category: "Brinco", price: 139, image: "https://www.giva.co/cdn/shop/files/ER03488_5.jpg?v=1775055888&width=1946", description: "Uma argola clássica com brilho polido. Do jeans e camiseta a um visual mais elegante, ela entra em qualquer ocasião.", style: "Essencial para o dia a dia" },
  { id: "brinco-gota", name: "Brinco Gota Cristal", category: "Brinco", price: 159, image: "https://stylo.pk/cdn/shop/files/J42965-16-01_ce7b303c-ff3b-45b6-be1b-36e2d6e75622.png?v=1767865858&width=600", description: "A forma alongada destaca o rosto e combina com cabelo preso, decotes limpos e ocasiões especiais.", style: "Elegante e expressivo" },
  { id: "pulseira-riviera", name: "Pulseira Riviera Prata", category: "Pulseira", price: 219, image: "https://www.giva.co/cdn/shop/files/BR01372_1_f45a0406-9e28-47be-81ce-ab358967ca93.jpg?v=1786452468&width=1946", description: "Brilho contínuo para usar sozinha ou junto do relógio. Uma pulseira que transforma produções simples com facilidade.", style: "Clássico e luminoso" },
  { id: "pulseira-elo", name: "Pulseira Elo Português", category: "Pulseira", price: 179, image: "https://www.giva.co/cdn/shop/files/BR01372_4_6c28f439-98c6-4c29-820c-5fa2dea59e4d.jpg?v=1788765954&width=1946", description: "O desenho dos elos traz personalidade sem pesar. Combine com pingente de pulseira e outras peças prateadas.", style: "Moderno e versátil" },
  { id: "anel-liso", name: "Anel Liso Espelhado", category: "Anel", price: 149, image: "https://images.tcdn.com.br/img/img_prod/836789/anel_de_prata_aro_liso_39577127_1_8459c697a852831eba7975b25fb77124.png", description: "Um anel de linhas limpas para usar sozinho ou misturar com outros. Fica bem em composições casuais e mais arrumadas.", style: "Minimalista" },
  { id: "alianca-classica", name: "Aliança Clássica 4 mm", category: "Aliança", price: 199, image: "https://acdn-us.mitiendanube.com/stores/934/316/products/img_2239-3fecd62208704d28f617776459708345-1024-1024.webp", description: "Clássica, confortável e fácil de combinar com outros anéis. Uma escolha simples para acompanhar momentos especiais.", style: "Atemporal" }
];
const product = productCatalog.find(item => item.id === productId);
const priceText = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const status = document.querySelector("#product-status");

if (product) {
  document.title = `${product.name} | ICE GEN`;
  document.querySelector("#product-image").src = product.image;
  document.querySelector("#product-image").alt = product.name;
  document.querySelector("#product-image").dataset.localFallback = ({ Colar: "corrente-1.png", Pingente: "pingente-1.png", Brinco: "brinco-1.png", Pulseira: "pulseira-1.png", Anel: "anel-1.png", Aliança: "alianca-1.png" })[product.category];
  document.querySelector("#product-image").addEventListener("error", event => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = `/assets/${image.dataset.localFallback}`;
  });
  document.querySelector("#product-category").textContent = `${product.category} · Prata 925`;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-price").textContent = priceText(product.price);
  document.querySelector("#product-description").textContent = product.description;
  document.querySelector("#product-style").textContent = product.style;
  const favoriteButton = document.querySelector("#favorite-product");
  let favorites = JSON.parse(localStorage.getItem("icegen-favorites") || "[]");
  function updateFavorite() {
    const active = favorites.includes(product.id);
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.innerHTML = `${active ? "♥" : "♡"} <span>${active ? "Salvo nos favoritos" : "Salvar nos favoritos"}</span>`;
  }
  updateFavorite();
  favoriteButton.addEventListener("click", () => {
    favorites = favorites.includes(product.id) ? favorites.filter(id => id !== product.id) : [...favorites, product.id];
    localStorage.setItem("icegen-favorites", JSON.stringify(favorites));
    updateFavorite();
    status.textContent = favorites.includes(product.id) ? "Peça salva nos favoritos." : "Peça removida dos favoritos.";
  });
  document.querySelector("#add-to-cart").addEventListener("click", () => {
    const count = Math.max(1, Math.min(10, Number(document.querySelector("#product-quantity").value) || 1));
    const cart = JSON.parse(localStorage.getItem("icegen-cart") || "[]");
    for (let index = 0; index < count; index++) cart.push({ ...product, images: [product.image] });
    localStorage.setItem("icegen-cart", JSON.stringify(cart));
    status.textContent = `${count} ${count === 1 ? "unidade adicionada" : "unidades adicionadas"} à sacola.`;
  });
  document.querySelector("#share-product").addEventListener("click", async () => {
    const shareData = { title: `${product.name} | ICE GEN`, text: product.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); status.textContent = "Link da peça copiado."; }
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = "Não foi possível compartilhar agora.";
    }
  });
} else {
  document.querySelector("#productPage").innerHTML = `<div class="product-page-empty"><p class="eyebrow">ICE GEN</p><h1>Não encontramos essa peça.</h1><a class="primary-link" href="/#produtos">Voltar ao catálogo</a></div>`;
}
