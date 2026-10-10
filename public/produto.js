const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const productCatalog = window.ICEGEN.products;
const product = productCatalog.find(item => item.id === productId);
const priceText = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const status = document.querySelector("#product-status");

if (product) {
  document.title = `${product.name} | ICE GEN`;
  document.querySelector("#product-image").src = product.image;
  document.querySelector("#product-image").alt = `Ilustração provisória de ${product.name}`;
  document.querySelector("#product-image").dataset.localFallback = ({ Colar: "corrente-1.png", Pingente: "pingente-1.png", Brinco: "brinco-1.png", Pulseira: "pulseira-1.png", Anel: "anel-1.png", Aliança: "alianca-1.png" })[product.category];
  document.querySelector("#product-image").addEventListener("error", event => {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = `/assets/${image.dataset.localFallback}`;
  });
  document.querySelector("#product-category").textContent = product.categoryLabel;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-price").textContent = priceText(product.price);
  document.querySelector("#product-description").textContent = product.description;
  document.querySelector("#product-material").textContent = product.material;
  if (product.measurement) {
    document.querySelector("#product-measurement").textContent = product.measurement;
    document.querySelector("#product-measurement-row").hidden = false;
  }
  const productContact = document.querySelector("#product-contact");
  productContact.href = `https://wa.me/5511948608322?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre ${product.name}.`)}`;
  const complementaryCategories = window.ICEGEN.complements[product.category] || [];
  const recommendations = productCatalog.filter(item => item.id !== product.id && complementaryCategories.includes(item.category)).slice(0, 3);
  const recommendationSection = document.querySelector("#productRecommendations");
  if (recommendations.length) {
    recommendationSection.hidden = false;
    document.querySelector("#recommendationGrid").innerHTML = recommendations.map(item => `
      <article class="product-card recommendation-card">
        <a class="recommendation-image" href="/produto.html?id=${encodeURIComponent(item.id)}">
          <img src="${item.image}" alt="Ilustração provisória de ${item.name}" loading="lazy">
          <span>Imagem ilustrativa</span>
        </a>
        <div class="recommendation-body"><span>${item.categoryLabel}</span><h3>${item.name}</h3>
          <strong>${priceText(item.price)}</strong><a class="add-button" href="/produto.html?id=${encodeURIComponent(item.id)}">Ver peça</a></div>
      </article>`).join("");
  }
  const favoriteButton = document.querySelector("#favorite-product");
  let favorites = JSON.parse(localStorage.getItem("icegen-favorites") || "[]");
  function updateFavorite() {
    const active = favorites.includes(product.id);
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.setAttribute("aria-label", active ? "Remover dos favoritos" : "Salvar nos favoritos");
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
