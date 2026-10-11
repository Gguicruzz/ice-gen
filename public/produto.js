const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const productCatalog = window.ICEGEN?.products || [];
const product = productCatalog.find(item => item.id === productId);
const priceText = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
const status = document.querySelector("#product-status");

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("icegen-cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function itemQuantity(item) {
  const quantity = Number(item.quantity);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

function addCartItem(cart, item, quantity = 1) {
  const existingItem = item.category === "presente" ? null : cart.find(entry => entry.id === item.id && entry.category !== "presente");
  const nextQuantity = existingItem ? itemQuantity(existingItem) + quantity : quantity;
  const unitPriceCents = Math.round(Number(item.price) * 100);
  if (!Number.isSafeInteger(nextQuantity) || nextQuantity < 1 || !Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0 || !Number.isSafeInteger(unitPriceCents * nextQuantity)) return false;
  if (existingItem) existingItem.quantity = nextQuantity;
  else cart.push({ ...item, quantity });
  return true;
}

function updateCartCount() {
  const count = readCart().reduce((total, item) => total + itemQuantity(item), 0);
  const cartLink = document.querySelector("#product-cart-count").parentElement;
  document.querySelector("#product-cart-count").textContent = count;
  cartLink.setAttribute("aria-label", `Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`);
}

updateCartCount();
window.addEventListener("storage", event => {
  if (event.key === "icegen-cart") updateCartCount();
});

if (product) {
  document.title = `${product.name} | ICE GEN`;
  const imagePaths = [product.image, ...(Array.isArray(product.images) ? product.images : [])];
  const usableImages = [...new Set(imagePaths.filter(path => typeof path === "string" && path.length > 0))];
  const mainImage = document.querySelector("#product-image");
  const largeImage = document.querySelector("#product-image-large");
  const thumbnails = document.querySelector("#product-gallery-thumbnails");
  const imageDialog = document.querySelector("#product-image-dialog");
  const imageCaption = product.imageIsIllustration === false ? "Foto da peça" : "Imagem ilustrativa · foto própria em breve";
  document.querySelector("#product-image-caption").textContent = imageCaption;
  document.querySelector("#product-image-dialog-caption").textContent = imageCaption;
  const fallbackByCategory = { corrente: "corrente-1.png", pingente: "pingente-1.png", brinco: "brinco-1.png", pulseira: "pulseira-1.png", anel: "anel-1.png", alianca: "alianca-1.png" };
  let activeImage = 0;

  function setImage(index) {
    activeImage = (index + usableImages.length) % usableImages.length;
    const src = usableImages[activeImage];
    const alt = `${product.imageIsIllustration === false ? product.name : `Ilustração provisória de ${product.name}`}${usableImages.length > 1 ? `, imagem ${activeImage + 1} de ${usableImages.length}` : ""}`;
    document.querySelector("#product-image-trigger").setAttribute("aria-label", `Ampliar imagem${usableImages.length > 1 ? ` ${activeImage + 1} de ${usableImages.length}` : ""} de ${product.name}`);
    [mainImage, largeImage].forEach(image => {
      image.src = src;
      image.alt = alt;
      image.dataset.localFallback = fallbackByCategory[product.category] || "hero-prata.png";
      image.dataset.fallbackApplied = "";
    });
    thumbnails.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === activeImage));
    });
  }

  if (usableImages.length) setImage(0);
  if (usableImages.length > 1) {
    thumbnails.hidden = false;
    thumbnails.innerHTML = usableImages.map((path, index) => `<button type="button" class="product-gallery-thumbnail${index === 0 ? " is-active" : ""}" aria-label="Ver imagem ${index + 1} de ${usableImages.length} de ${product.name}" aria-pressed="${index === 0}" data-image-index="${index}"><img src="${path}" alt="" loading="lazy"></button>`).join("");
    thumbnails.addEventListener("click", event => {
      const button = event.target.closest("[data-image-index]");
      if (!button) return;
      setImage(Number(button.dataset.imageIndex));
      thumbnails.querySelectorAll("button").forEach((item, index) => item.classList.toggle("is-active", index === activeImage));
    });
  }

  [mainImage, largeImage].forEach(image => image.addEventListener("error", event => {
    const image = event.currentTarget;
    if (!image.dataset.localFallback || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = `/assets/${image.dataset.localFallback}`;
  }));
  document.querySelector("#product-image-trigger").addEventListener("click", () => {
    if (typeof imageDialog.showModal === "function") imageDialog.showModal();
  });
  document.querySelector("#close-product-image").addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", event => {
    if (event.target === imageDialog) imageDialog.close();
  });

  document.querySelector("#product-category").textContent = product.categoryLabel;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-price").textContent = priceText(product.price);
  document.querySelector("#product-description").textContent = product.description;
  const productSpecs = document.querySelector("#product-specs");
  const availableDetails = [
    ["material", "material"], ["measurement", "measurement"], ["weight", "weight"],
    ["clasp", "clasp"], ["finish", "finish"], ["includedItems", "included"]
  ];
  let hasDetails = false;
  availableDetails.forEach(([field, rowId]) => {
    const value = Array.isArray(product[field]) ? product[field].filter(Boolean).join(", ") : product[field];
    if (value === undefined || value === null || String(value).trim() === "") return;
    document.querySelector(`#product-${rowId}`).textContent = value;
    document.querySelector(`#product-${rowId}-row`).hidden = false;
    hasDetails = true;
  });
  productSpecs.hidden = !hasDetails;
  const careText = product.care || (product.material === "Prata 925" ? "A prata 925 pode escurecer naturalmente com o tempo. Guarde sua peça seca e limpe com uma flanela macia." : "");
  if (careText) {
    document.querySelector("#product-care").textContent = careText;
    document.querySelector("#product-care-details").hidden = false;
  }
  const productContact = document.querySelector("#product-contact");
  productContact.href = `https://wa.me/5511948608322?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre ${product.name}.`)}`;
  const complementaryCategories = window.ICEGEN?.complements?.[product.category] || [];
  const recommendations = productCatalog.filter(item => item.id !== product.id && complementaryCategories.includes(item.category)).slice(0, 3);
  const recommendationSection = document.querySelector("#productRecommendations");
  const recommendationGrid = document.querySelector("#recommendationGrid");
  if (recommendations.length) {
    recommendationSection.hidden = false;
    recommendationGrid.innerHTML = recommendations.map(item => `
      <article class="product-card recommendation-card">
        <a class="recommendation-image" href="/produto.html?id=${encodeURIComponent(item.id)}">
          <img src="${item.image}" alt="Ilustração provisória de ${item.name}" loading="lazy">
          <span>Imagem ilustrativa</span>
        </a>
        <div class="recommendation-body"><span>${item.categoryLabel}</span><h3>${item.name}</h3>
          <strong>${priceText(item.price)}</strong>
          <label class="combination-check" for="complement-${encodeURIComponent(item.id)}"><input id="complement-${encodeURIComponent(item.id)}" type="checkbox" data-complement-id="${item.id}"><span>Selecionar para combinar</span></label>
          <a class="add-button" href="/produto.html?id=${encodeURIComponent(item.id)}">Ver peça</a></div>
      </article>`).join("");

    const selectionButton = document.querySelector("#add-selected-products");
    const selectionSubtotal = document.querySelector("#combination-subtotal");
    function selectedProducts() {
      const selectedIds = [...recommendationGrid.querySelectorAll("[data-complement-id]:checked")].map(input => input.dataset.complementId);
      return recommendations.filter(item => selectedIds.includes(item.id));
    }
    function updateCombinationSummary() {
      const selected = selectedProducts();
      const subtotal = selected.reduce((sum, item) => sum + item.price, 0);
      selectionSubtotal.textContent = selected.length
        ? `Subtotal de ${selected.length} ${selected.length === 1 ? "peça" : "peças"}: ${priceText(subtotal)}`
        : "Selecione peças para ver o subtotal.";
      selectionButton.disabled = selected.length === 0;
      if (selected.length) selectionButton.textContent = "Adicionar seleção à sacola";
    }
    recommendationGrid.addEventListener("change", event => {
      if (event.target.matches("[data-complement-id]")) updateCombinationSummary();
    });
    selectionButton.addEventListener("click", () => {
      if (selectionButton.disabled) return;
      const selected = selectedProducts();
      if (!selected.length) return;
      const cart = readCart();
      for (const item of selected) {
        if (!addCartItem(cart, item)) {
          status.textContent = "Não foi possível atualizar a sacola. Tente novamente.";
          return;
        }
      }
      localStorage.setItem("icegen-cart", JSON.stringify(cart));
      updateCartCount();
      recommendationGrid.querySelectorAll("[data-complement-id]:checked").forEach(input => { input.checked = false; });
      updateCombinationSummary();
      status.textContent = `${selected.length} ${selected.length === 1 ? "peça adicionada" : "peças adicionadas"} à sacola.`;
      selectionButton.disabled = true;
      selectionButton.textContent = "Peças adicionadas";
      window.clearTimeout(selectionButton.feedbackTimer);
      selectionButton.feedbackTimer = window.setTimeout(() => {
        selectionButton.textContent = "Adicionar seleção à sacola";
      }, 1200);
    });
    updateCombinationSummary();
  }
  const favoriteButton = document.querySelector("#favorite-product");
  let favorites;
  try {
    const storedFavorites = JSON.parse(localStorage.getItem("icegen-favorites") || "[]");
    favorites = Array.isArray(storedFavorites) ? storedFavorites : [];
  } catch {
    favorites = [];
  }
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
  const addToCartButton = document.querySelector("#add-to-cart");
  const quantityInput = document.querySelector("#product-quantity");
  function validQuantity(value = quantityInput.value) {
    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
  }
  function setQuantity(value) {
    const quantity = Number(value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
    quantityInput.value = quantity;
    quantityInput.setAttribute("aria-invalid", "false");
    if (status.textContent.startsWith("Informe uma quantidade") || status.textContent.startsWith("A quantidade máxima")) status.textContent = "";
    return true;
  }
  document.querySelectorAll("[data-quantity-adjust]").forEach(button => {
    button.addEventListener("click", () => {
      const current = validQuantity() || 1;
      const adjustment = Number(button.dataset.quantityAdjust);
      if (!setQuantity(Math.max(1, current + adjustment))) status.textContent = "A quantidade máxima suportada pelo navegador foi alcançada.";
    });
  });
  quantityInput.addEventListener("input", () => quantityInput.setAttribute("aria-invalid", String(validQuantity() === null)));
  quantityInput.addEventListener("change", () => {
    if (validQuantity() === null) {
      quantityInput.setAttribute("aria-invalid", "true");
      status.textContent = "Informe uma quantidade inteira maior que zero.";
    }
    else setQuantity(validQuantity());
  });
  addToCartButton.addEventListener("click", () => {
    if (addToCartButton.disabled) return;
    const count = validQuantity();
    if (count === null) {
      quantityInput.setAttribute("aria-invalid", "true");
      status.textContent = "Informe uma quantidade inteira maior que zero.";
      quantityInput.focus();
      return;
    }
    const cart = readCart();
    if (!addCartItem(cart, product, count)) {
      status.textContent = "A quantidade informada é grande demais. Confira o número e tente novamente.";
      return;
    }
    localStorage.setItem("icegen-cart", JSON.stringify(cart));
    updateCartCount();
    status.textContent = `${count} ${count === 1 ? "unidade adicionada" : "unidades adicionadas"} à sacola.`;
    addToCartButton.disabled = true;
    addToCartButton.classList.add("is-added");
    addToCartButton.textContent = "Adicionado à sacola";
    window.clearTimeout(addToCartButton.feedbackTimer);
    addToCartButton.feedbackTimer = window.setTimeout(() => {
      addToCartButton.disabled = false;
      addToCartButton.classList.remove("is-added");
      addToCartButton.textContent = "Adicionar à sacola";
    }, 1000);
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
