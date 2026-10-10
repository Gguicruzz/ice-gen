const products = window.ICEGEN.products;
const complements = window.ICEGEN.complements;
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const imagePath = path => path.startsWith("http") || path.startsWith("/") ? path : `/assets/${path}`;
const fallbackByCategory = { corrente: "corrente-1.png", pingente: "pingente-1.png", brinco: "brinco-1.png", pulseira: "pulseira-1.png", anel: "anel-1.png", alianca: "alianca-1.png" };
const state = { cart: JSON.parse(localStorage.getItem("icegen-cart") || "[]"), favorites: JSON.parse(localStorage.getItem("icegen-favorites") || "[]"), filter: "todos", gift: { chain: null, pendant: null, wrap: null }, activeSlide: 0, showFavorites: false };
const $ = selector => document.querySelector(selector);
const productGrid = $("#productGrid");
const slides = [
  { eyebrow: "Joias em prata 925", title: "Frio no tom.<br>Forte no gesto.", description: "A prata tem seu jeito de aparecer. O seu estilo também.", image: "/assets/hero-prata.png", alt: "Ilustração provisória de joias em prata", position: "68% center" },
  { eyebrow: "Para usar sempre", title: "Uma argola<br>no seu ritmo.", description: "Use sozinha ou combine com outras peças que você já tem.", image: "/assets/brinco-1.png", alt: "Ilustração provisória de brincos", position: "68% center" },
  { eyebrow: "Correntes e pulseiras", title: "Uma peça de cada vez.<br>Ou várias juntas.", description: "Misture comprimentos e formatos até encontrar uma combinação que funcione para você.", image: "/assets/elo-1.png", alt: "Ilustração provisória de pulseira em prata", position: "68% center" },
  { eyebrow: "Um detalhe seu", title: "Escolha o que<br>vai com você.", description: "Um pingente muda a leitura da corrente. Escolha um formato que tenha a ver com o seu jeito de usar joias.", image: "/assets/coracao-1.png", alt: "Ilustração provisória de pingente em prata", position: "68% center" }
];

function renderProducts() {
  let visible = state.filter === "todos" ? products : products.filter(product => product.category === state.filter);
  if (state.showFavorites) visible = visible.filter(product => state.favorites.includes(product.id));
  productGrid.innerHTML = visible.length ? visible.map(product => `
    <article class="product-card">
      <div class="product-media"><a href="/produto.html?id=${product.id}" aria-label="Ver ${product.name}"><img class="product-photo" src="${imagePath(product.image)}" data-local-fallback="${fallbackByCategory[product.category]}" alt="Ilustração provisória de ${product.name}" loading="lazy"></a><button class="heart-button ${state.favorites.includes(product.id) ? "is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${state.favorites.includes(product.id) ? "Remover dos" : "Adicionar aos"} favoritos" aria-pressed="${state.favorites.includes(product.id)}">${state.favorites.includes(product.id) ? "♥" : "♡"}</button><span class="silver-badge">Imagem ilustrativa</span></div>
      <div class="product-body"><div class="product-meta"><div><span>${categoryName(product.category)}</span><h3>${product.name}</h3></div><strong class="price">${money(product.price)}</strong></div><p class="product-description">${product.description}</p><div class="product-actions"><a class="add-button" href="/produto.html?id=${product.id}">Ver produto <span aria-hidden="true">↗</span></a><button class="add-button add-cart" type="button" data-add="${product.id}">Adicionar à sacola</button></div></div>
    </article>`).join("") : `<div class="empty-favorites"><span>♡</span><h3>Nenhuma joia salva.</h3><p>Toque no coração de uma peça para adicioná-la aos favoritos.</p><button type="button" class="secondary-link" id="clearFavoritesFilter">Voltar ao catálogo</button></div>`;
  const clear = $("#clearFavoritesFilter");
  if (clear) clear.addEventListener("click", () => { state.showFavorites = false; $("#favoritesButton").classList.remove("is-active"); renderProducts(); });
}

function categoryName(category) { return products.find(item => item.category === category)?.categoryLabel || category; }
function saveState() { localStorage.setItem("icegen-cart", JSON.stringify(state.cart)); localStorage.setItem("icegen-favorites", JSON.stringify(state.favorites)); }
function renderCart() {
  $("#cartCount").textContent = state.cart.length;
  $("#cartTotal").textContent = money(state.cart.reduce((sum, item) => sum + item.price, 0));
  $("#cartItems").innerHTML = state.cart.length ? state.cart.map((item, index) => `<div class="cart-row"><img src="${imagePath(products.find(product => product.id === item.id)?.image || item.image || item.images?.[0] || "gift-box.png")}" alt="${item.name}"><div><strong>${item.name}</strong><span>${money(item.price)}</span></div><button class="remove" type="button" data-remove="${index}" aria-label="Remover ${item.name}">Remover</button></div>`).join("") : `<div class="cart-empty"><span>✧</span><h3>Sua sacola está esperando.</h3><p>Encontre uma joia para chamar de sua.</p><a href="#produtos" class="secondary-link" id="goCatalog">Explorar joias</a></div>`;
  renderSetSuggestions();
}
function renderSetSuggestions() {
  const cats = new Set(state.cart.map(item => item.category));
  const needed = [...new Set([...cats].flatMap(category => complements[category] || []))].filter(category => !cats.has(category) || category === "brinco");
  const suggestions = needed.flatMap(category => products.filter(product => product.category === category)).slice(0, 3);
  $("#setBuilder").classList.toggle("show", state.cart.length > 0 && suggestions.length > 0);
  $("#setOptions").innerHTML = suggestions.map(product => `<button class="set-option" type="button" data-add="${product.id}"><img src="${imagePath(product.image)}" alt=""><span>${product.name}<strong>${money(product.price)}</strong></span><b>+</b></button>`).join("");
}
function addToCart(id, open = true) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  state.cart.push(product); saveState(); renderCart(); showToast(`${product.name} adicionada à sacola`); if (open) toggleDrawer("cartDrawer", true);
}
function toggleDrawer(id, open) {
  const drawer = $(`#${id}`); drawer.classList.toggle("open", open); drawer.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("has-overlay", open || $("#loginModal").classList.contains("open"));
}
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2300); }
function updateFavoriteCount() { $("#favoriteCount").textContent = state.favorites.length; }
function toggleFavorite(id) { state.favorites = state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id]; saveState(); updateFavoriteCount(); renderProducts(); showToast(state.favorites.includes(id) ? "Joia salva nos favoritos" : "Joia removida dos favoritos"); }

function renderSlide(index) {
  state.activeSlide = (index + slides.length) % slides.length;
  const slide = slides[state.activeSlide];
  $(".hero").style.setProperty("--hero-position", slide.position || "center");
  $("#heroEyebrow").textContent = slide.eyebrow; $("#heroTitle").innerHTML = slide.title; $("#heroDescription").textContent = slide.description;
  const image = $("#heroImage"); image.classList.add("is-changing"); window.setTimeout(() => { image.src = slide.image; image.alt = slide.alt; image.classList.remove("is-changing"); }, 160);
  $("#heroIndex").textContent = `${String(state.activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  $("#heroDots").innerHTML = slides.map((item, dot) => `<button type="button" class="hero-dot ${dot === state.activeSlide ? "active" : ""}" data-slide="${dot}" aria-label="Mostrar slide ${dot + 1}" aria-current="${dot === state.activeSlide ? "true" : "false"}"></button>`).join("");
}

const giftChoices = {
  chain: products.filter(item => item.category === "corrente"),
  pendant: products.filter(item => item.category === "pingente"),
  wrap: [{ id: "wrap-paper", name: "Embalagem 1", price: 39, image: "/assets/gift-box.png" }, { id: "wrap-velvet", name: "Embalagem 2", price: 59, image: "/assets/gift-box.png" }]
};
const giftCarouselIndex = { chain: 0, pendant: 0, wrap: 0 };
const giftKindLabels = { chain: "corrente", pendant: "pingente", wrap: "embalagem" };
function renderGiftChoices() {
  for (const kind of ["chain", "pendant", "wrap"]) {
    const container = $(`#${kind}Choices`);
    const disabled = kind === "pendant" && !state.gift.chain || kind === "wrap" && !state.gift.pendant;
    const items = giftChoices[kind];
    const index = Math.min(giftCarouselIndex[kind], items.length - 1);
    giftCarouselIndex[kind] = index;
    const item = items[index];
    const selected = state.gift[kind] === item.id;
    const image = item.image;
    const fallback = kind === "chain" ? "corrente-1.png" : kind === "pendant" ? "pingente-1.png" : "gift-box.png";
    container.innerHTML = `<div class="carousel-stage" data-carousel-stage="${kind}" tabindex="0" role="group" aria-label="${item.name}, ${index + 1} de ${items.length}">
      <img class="carousel-image" src="${imagePath(image)}" data-local-fallback="${fallback}" alt="${item.name}" draggable="false">
      <button class="carousel-arrow carousel-prev" type="button" data-carousel-move="-1" data-carousel-kind="${kind}" aria-label="${kind === "wrap" ? "Embalagem" : kind === "chain" ? "Corrente" : "Pingente"} anterior" ${disabled ? "disabled" : ""}>←</button>
      <button class="carousel-arrow carousel-next" type="button" data-carousel-move="1" data-carousel-kind="${kind}" aria-label="Próxima opção de ${giftKindLabels[kind]}" ${disabled ? "disabled" : ""}>→</button>
      <span class="carousel-count">${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}</span>
      ${selected ? '<span class="carousel-selected">✓ Selecionado</span>' : ""}
    </div>
    <div class="carousel-caption" aria-live="polite">
      <div class="carousel-product-info"><p>${giftKindLabels[kind]}</p><h4>${item.name}</h4><strong>${money(item.price)}</strong></div>
      <button class="carousel-select ${selected ? "is-selected" : ""}" type="button" data-gift-kind="${kind}" data-gift-id="${item.id}" aria-pressed="${selected}" ${disabled ? "disabled" : ""}>${selected ? "Selecionado ✓" : "Escolher peça"}</button>
    </div>
    <div class="carousel-dots" role="group" aria-label="Escolher ${giftKindLabels[kind]}">${items.map((choice, dot) => `<button class="carousel-dot ${dot === index ? "is-active" : ""} ${choice.id === state.gift[kind] ? "is-selected" : ""}" type="button" data-carousel-kind="${kind}" data-carousel-index="${dot}" aria-label="${choice.name}" aria-current="${dot === index ? "true" : "false"}" ${disabled ? "disabled" : ""}></button>`).join("")}</div>`;
  }
  updateGift();
}
function updateGift() {
  const chain = products.find(item => item.id === state.gift.chain), pendant = products.find(item => item.id === state.gift.pendant), wrap = giftChoices.wrap.find(item => item.id === state.gift.wrap);
  const chainReady = Boolean(chain), pendantReady = Boolean(pendant), wrapReady = Boolean(wrap);
  $("#pendantStep").classList.toggle("is-locked", !chainReady); $("#wrapStep").classList.toggle("is-locked", !pendantReady);
  const total = (chain?.price || 0) + (pendant?.price || 0) + (wrap?.price || 0);
  $("#giftTotal").textContent = chain && pendant && wrap ? money(total) : "A selecionar";
  $("#addGift").disabled = !(chain && pendant && wrap);
  updateGiftSummary(chain, pendant, wrap);
  document.querySelectorAll(".carousel-select").forEach(button => { const selected = state.gift[button.dataset.giftKind] === button.dataset.giftId; button.classList.toggle("is-selected", selected); button.setAttribute("aria-pressed", String(selected)); });
}
function updateGiftSummary(chain, pendant, wrap) {
  const lines = [
    ["giftChain", chain],
    ["giftPendant", pendant],
    ["giftWrap", wrap]
  ];
  for (const [prefix, item] of lines) {
    $(`#${prefix}Name`).textContent = item?.name || "Pendente";
    $(`#${prefix}Price`).textContent = item ? money(item.price) : "—";
  }
  const complete = Boolean(chain && pendant && wrap);
  $("#giftStatus").textContent = complete ? "Conjunto completo. Pronto para adicionar à sacola." : "Complete as 3 etapas para adicionar à sacola.";
}
function selectGift(kind, id) {
  if (kind === "pendant" && !state.gift.chain || kind === "wrap" && !state.gift.pendant) return;
  const itemIndex = giftChoices[kind].findIndex(item => item.id === id);
  if (itemIndex < 0) return;
  giftCarouselIndex[kind] = itemIndex;
  state.gift[kind] = id;
  if (kind === "chain") { state.gift.pendant = null; state.gift.wrap = null; }
  if (kind === "pendant") state.gift.wrap = null;
  renderGiftChoices();
  document.querySelectorAll(".builder-step").forEach(step => step.classList.toggle("is-current", step.id === `${kind}Step`));
  if (kind === "chain") $("#pendantStep").scrollIntoView({ behavior: "smooth", block: "center" });
  if (kind === "pendant") $("#wrapStep").scrollIntoView({ behavior: "smooth", block: "center" });
  if (kind === "wrap") $("#addGift").focus({ preventScroll: true });
}

function moveGiftCarousel(kind, targetIndex, preserveFocus = false) {
  if (!giftChoices[kind] || kind === "pendant" && !state.gift.chain || kind === "wrap" && !state.gift.pendant) return;
  const length = giftChoices[kind].length;
  const active = preserveFocus ? document.activeElement : null;
  let focusSelector = "";
  if (active?.dataset.carouselKind === kind && active.hasAttribute("data-carousel-move")) focusSelector = `[data-carousel-move="${active.dataset.carouselMove}"]`;
  else if (active?.dataset.carouselKind === kind && active.hasAttribute("data-carousel-index")) focusSelector = `[data-carousel-index="${active.dataset.carouselIndex}"]`;
  else if (active?.matches(".carousel-stage")) focusSelector = ".carousel-stage";
  giftCarouselIndex[kind] = (targetIndex + length) % length;
  renderGiftChoices();
  if (focusSelector) $(`#${kind}Choices ${focusSelector}`).focus({ preventScroll: true });
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]"), remove = event.target.closest("[data-remove]"), favorite = event.target.closest("[data-favorite]"), gift = event.target.closest(".carousel-select[data-gift-kind]"), carouselMove = event.target.closest("[data-carousel-move]"), carouselDot = event.target.closest("[data-carousel-index]"), slide = event.target.closest("[data-slide]"), filter = event.target.closest("[data-menu-filter]"), combo = event.target.closest("[data-combo-filter]");
  if (add) addToCart(add.dataset.add);
  if (remove) { state.cart.splice(Number(remove.dataset.remove), 1); saveState(); renderCart(); }
  if (favorite) toggleFavorite(favorite.dataset.favorite);
  if (gift) selectGift(gift.dataset.giftKind, gift.dataset.giftId);
  if (carouselMove) moveGiftCarousel(carouselMove.dataset.carouselKind, giftCarouselIndex[carouselMove.dataset.carouselKind] + Number(carouselMove.dataset.carouselMove), true);
  if (carouselDot) moveGiftCarousel(carouselDot.dataset.carouselKind, Number(carouselDot.dataset.carouselIndex), true);
  if (slide) renderSlide(Number(slide.dataset.slide));
  if (filter) { applyFilter(filter.dataset.menuFilter); toggleMenu(false); $("#produtos").scrollIntoView({ behavior: "smooth" }); }
  if (combo) applyFilter(combo.dataset.comboFilter);
  if (event.target.closest("#goCatalog")) {
    event.preventDefault();
    toggleDrawer("cartDrawer", false);
    window.location.hash = "produtos";
    $("#produtos").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
const carouselPointers = new Map();
document.addEventListener("pointerdown", event => {
  const stage = event.target.closest(".carousel-stage");
  if (stage && !event.target.closest("button")) carouselPointers.set(event.pointerId, { x: event.clientX, y: event.clientY, kind: stage.dataset.carouselStage });
});
document.addEventListener("pointerup", event => {
  const start = carouselPointers.get(event.pointerId);
  carouselPointers.delete(event.pointerId);
  if (!start) return;
  const distanceX = event.clientX - start.x, distanceY = event.clientY - start.y;
  if (Math.abs(distanceX) > 42 && Math.abs(distanceX) > Math.abs(distanceY)) moveGiftCarousel(start.kind, giftCarouselIndex[start.kind] + (distanceX < 0 ? 1 : -1));
});
document.addEventListener("pointercancel", event => carouselPointers.delete(event.pointerId));
document.addEventListener("keydown", event => {
  const stage = event.target.closest(".carousel-stage");
  if (!stage || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  moveGiftCarousel(stage.dataset.carouselStage, giftCarouselIndex[stage.dataset.carouselStage] + (event.key === "ArrowRight" ? 1 : -1), true);
});
document.addEventListener("error", event => {
  const image = event.target;
  if (image.tagName !== "IMG" || !image.dataset.localFallback || image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = `/assets/${image.dataset.localFallback}`;
}, true);
function applyFilter(filter) { state.filter = filter; state.showFavorites = false; $("#favoritesButton").classList.remove("is-active"); document.querySelectorAll(".filter").forEach(button => button.classList.toggle("active", button.dataset.filter === filter)); renderProducts(); }

const menuButton = $("#jewelryMenuButton"), menu = $("#jewelryMenu"), contactButton = $("#contactButton"), contactPopover = $("#contactPopover");
function toggleMenu(force = !menu.classList.contains("open")) { menu.classList.toggle("open", force); menu.setAttribute("aria-hidden", String(!force)); menuButton.setAttribute("aria-expanded", String(force)); if (force) toggleContact(false); }
function toggleContact(force = !contactPopover.classList.contains("open")) { contactPopover.classList.toggle("open", force); contactPopover.setAttribute("aria-hidden", String(!force)); contactButton.setAttribute("aria-expanded", String(force)); if (force) toggleMenu(false); }
menuButton.addEventListener("click", () => toggleMenu()); contactButton.addEventListener("click", () => toggleContact()); $("#megaContactButton").addEventListener("click", () => { toggleMenu(false); toggleContact(true); });
document.addEventListener("click", event => { if (!event.target.closest(".menu-wrap")) toggleMenu(false); if (!event.target.closest("#contactPopover") && event.target !== contactButton) toggleContact(false); });

$("#favoritesButton").addEventListener("click", () => { state.showFavorites = !state.showFavorites; $("#favoritesButton").classList.toggle("is-active", state.showFavorites); state.filter = "todos"; document.querySelectorAll(".filter").forEach(button => button.classList.toggle("active", button.dataset.filter === "todos")); renderProducts(); $("#produtos").scrollIntoView({ behavior: "smooth" }); });
$("#heroPrev").addEventListener("click", () => renderSlide(state.activeSlide - 1)); $("#heroNext").addEventListener("click", () => renderSlide(state.activeSlide + 1));
let carouselTimer = window.setInterval(() => renderSlide(state.activeSlide + 1), 6500); $(".hero").addEventListener("mouseenter", () => window.clearInterval(carouselTimer)); $(".hero").addEventListener("mouseleave", () => { carouselTimer = window.setInterval(() => renderSlide(state.activeSlide + 1), 6500); });

$("#cartButton").addEventListener("click", () => toggleDrawer("cartDrawer", true)); $("#closeCart").addEventListener("click", () => toggleDrawer("cartDrawer", false)); $("#cartDrawer").addEventListener("click", event => { if (event.target === $("#cartDrawer")) toggleDrawer("cartDrawer", false); });
$("#skipSet").addEventListener("click", () => $("#setBuilder").classList.remove("show"));
$("#checkout").addEventListener("click", () => { if (!state.cart.length) return showToast("Adicione uma joia à sacola para continuar"); const lines = state.cart.map(item => `• ${item.name} — ${money(item.price)}`).join("\n"); const message = encodeURIComponent(`Olá! Gostaria de finalizar este pedido ICE GEN:\n${lines}\nTotal: ${$("#cartTotal").textContent}`); window.open(`https://wa.me/5511948608322?text=${message}`, "_blank", "noopener"); });

$("#loginButton").addEventListener("click", () => { $("#loginModal").classList.add("open"); $("#loginModal").setAttribute("aria-hidden", "false"); document.body.classList.add("has-overlay"); $("#emailInput").focus(); });
function closeLogin() { $("#loginModal").classList.remove("open"); $("#loginModal").setAttribute("aria-hidden", "true"); document.body.classList.remove("has-overlay"); }
$("#closeLogin").addEventListener("click", closeLogin); $("#loginModal").addEventListener("click", event => { if (event.target === $("#loginModal")) closeLogin(); });
$("#loginForm").addEventListener("submit", event => { event.preventDefault(); $("#loginStatus").textContent = "Área de conta demonstrativa. O acesso será ativado com a integração da loja."; });
$("#addGift").addEventListener("click", () => { const chain = products.find(item => item.id === state.gift.chain), pendant = products.find(item => item.id === state.gift.pendant), wrap = giftChoices.wrap.find(item => item.id === state.gift.wrap); if (!chain || !pendant || !wrap) return; state.cart.push({ id: `gift-${Date.now()}`, name: `Presente: ${chain.name} + ${pendant.name} · ${wrap.name}`, category: "presente", price: chain.price + pendant.price + wrap.price, image: "/assets/gift-box.png" }); saveState(); renderCart(); showToast("Presente adicionado à sacola"); toggleDrawer("cartDrawer", true); });

document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
renderProducts(); renderCart(); renderGiftChoices(); renderSlide(0); updateFavoriteCount();
