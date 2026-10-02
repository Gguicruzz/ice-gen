const silverSet = "925";
const products = [
  { id: "corrente-veneziana", name: "Corrente Veneziana 45 cm", category: "corrente", price: 189, images: ["https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946", "https://kapurjewels.com/cdn/shop/files/20250626144034046_295a2b7c.jpg?v=1752474300&width=1946"], description: "Uma corrente delicada que acompanha desde uma camisa aberta até um vestido de noite. Use sozinha ou com seu pingente favorito." },
  { id: "corrente-cartier", name: "Corrente Elo Cartier 60 cm", category: "corrente", price: 249, images: ["https://jorgerevilla.com/2748-ultralarge_default/sterling-silver-chain-45-cm.jpg", "https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946"], description: "Elos marcantes que valorizam produções básicas e urbanas. Experimente em camadas com uma corrente mais curta." },
  { id: "pingente-luz", name: "Pingente Ponto de Luz", category: "pingente", price: 119, images: ["https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946", "https://kapurjewels.com/cdn/shop/files/20250626144034046_295a2b7c.jpg?v=1752474300&width=1946"], description: "Um brilho sutil para iluminar o colo. Fica especialmente bonito em uma corrente fina, com decote em V ou camisa aberta." },
  { id: "pingente-coracao", name: "Pingente Coração Polido", category: "pingente", price: 99, images: ["https://atraktivajoias.cdn.magazord.com.br/img/2024/09/produto/5246/pingente-coracao-prata-925.jpg?ims=fit-in%2F1200x1200%2Ffilters%3Afill%28white%29", "https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946"], description: "Um símbolo delicado que combina com correntes venezianas e looks de todos os dias. Também é uma escolha cheia de significado para presentear." },
  { id: "brinco-argola", name: "Brinco Argola Fina", category: "brinco", price: 139, images: ["https://www.giva.co/cdn/shop/files/ER03488_5.jpg?v=1775055888&width=1946", "https://glitzjewellery.com/cdn/shop/files/E07653AD-3B67-41F8-AEA7-ACCEA2693571.jpg?v=1768339193"], description: "Uma argola clássica com brilho polido. Do jeans e camiseta a um visual mais elegante, ela entra em qualquer ocasião." },
  { id: "brinco-gota", name: "Brinco Gota Cristal", category: "brinco", price: 159, images: ["https://stylo.pk/cdn/shop/files/J42965-16-01_ce7b303c-ff3b-45b6-be1b-36e2d6e75622.png?v=1767865858&width=600", "https://www.giva.co/cdn/shop/files/ER03488_5.jpg?v=1775055888&width=1946"], description: "A forma alongada destaca o rosto e combina com cabelo preso, decotes limpos e ocasiões especiais." },
  { id: "pulseira-riviera", name: "Pulseira Riviera Prata", category: "pulseira", price: 219, images: ["https://www.giva.co/cdn/shop/files/BR01372_1_f45a0406-9e28-47be-81ce-ab358967ca93.jpg?v=1786452468&width=1946", "https://www.giva.co/cdn/shop/files/BR01372_1_f45a0406-9e28-47be-81ce-ab358967ca93.jpg?v=1786452468&width=1946"], description: "Brilho contínuo para usar sozinha ou junto do relógio. Uma pulseira que transforma produções simples com facilidade." },
  { id: "pulseira-elo", name: "Pulseira Elo Português", category: "pulseira", price: 179, images: ["https://www.giva.co/cdn/shop/files/BR01372_4_6c28f439-98c6-4c29-820c-5fa2dea59e4d.jpg?v=1788765954&width=1946", "https://www.giva.co/cdn/shop/files/BR01372_1_f45a0406-9e28-47be-81ce-ab358967ca93.jpg?v=1786452468&width=1946"], description: "O desenho dos elos traz personalidade sem pesar. Combine com pingente de pulseira e outras peças prateadas." },
  { id: "anel-liso", name: "Anel Liso Espelhado", category: "anel", price: 149, images: ["https://images.tcdn.com.br/img/img_prod/836789/anel_de_prata_aro_liso_39577127_1_8459c697a852831eba7975b25fb77124.png", "https://www.giva.co/cdn/shop/files/ER03488_5.jpg?v=1775055888&width=1946"], description: "Um anel de linhas limpas para usar sozinho ou misturar com outros. Fica bem em composições casuais e mais arrumadas." },
  { id: "alianca-classica", name: "Aliança Clássica 4 mm", category: "alianca", price: 199, images: ["https://acdn-us.mitiendanube.com/stores/934/316/products/img_2239-3fecd62208704d28f617776459708345-1024-1024.webp", "https://images.tcdn.com.br/img/img_prod/836789/anel_de_prata_aro_liso_39577127_1_8459c697a852831eba7975b25fb77124.png"], description: "Clássica, confortável e fácil de combinar com outros anéis. Uma escolha simples para acompanhar momentos especiais." }
];

const complements = { corrente: ["pingente"], pingente: ["corrente", "pulseira"], brinco: ["brinco"], pulseira: ["pingente"], anel: ["alianca"], alianca: ["anel"] };
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const imagePath = path => path.startsWith("http") ? path : `/assets/${path}`;
const fallbackByCategory = { corrente: "corrente-1.png", pingente: "pingente-1.png", brinco: "brinco-1.png", pulseira: "pulseira-1.png", anel: "anel-1.png", alianca: "alianca-1.png" };
const state = { cart: JSON.parse(localStorage.getItem("icegen-cart") || "[]"), favorites: JSON.parse(localStorage.getItem("icegen-favorites") || "[]"), filter: "todos", gift: { chain: null, pendant: null, wrap: null }, activeSlide: 0, showFavorites: false };
const $ = selector => document.querySelector(selector);
const productGrid = $("#productGrid");
const slides = [
  { eyebrow: "Prata 925 selecionada", title: "Joias que traduzem<br>o seu jeito de ser.", description: "Prata, brilho e personalidade em peças para acompanhar você todos os dias.", image: "https://www.giva.co/cdn/shop/files/ER0150_PD0179_5.jpg?v=1765272988&width=1946", alt: "Colar de prata e brincos delicados" },
  { eyebrow: "Detalhes que fazem diferença", title: "O brilho certo<br>para cada momento.", description: "Descubra brincos, pulseiras e colares que acompanham o seu ritmo, do dia à noite.", image: "https://www.giva.co/cdn/shop/files/ER03488_5.jpg?v=1775055888&width=1946", alt: "Argolas de prata com acabamento polido" },
  { eyebrow: "Escolha, combine, use", title: "Sua composição.<br>Suas regras.", description: "Misture correntes, pingentes e pulseiras para criar combinações com a sua identidade.", image: "https://www.giva.co/cdn/shop/files/BR01372_1_f45a0406-9e28-47be-81ce-ab358967ca93.jpg?v=1786452468&width=1946", alt: "Pulseira em prata delicada" },
  { eyebrow: "Mais que uma joia", title: "Uma forma de<br>se expressar.", description: "A ICE GEN nasceu para unir luxo, estilo urbano e identidade em peças que fazem parte de quem usa.", image: "https://kapurjewels.com/cdn/shop/files/20250626144034046_295a2b7c.jpg?v=1752474300&width=1946", alt: "Pingente de prata sobre fundo claro" }
];

function renderProducts() {
  let visible = state.filter === "todos" ? products : products.filter(product => product.category === state.filter);
  if (state.showFavorites) visible = visible.filter(product => state.favorites.includes(product.id));
  productGrid.innerHTML = visible.length ? visible.map(product => `
    <article class="product-card">
      <div class="product-media"><a href="/produto.html?id=${product.id}" target="_blank" rel="noopener" aria-label="Ver ${product.name}">${product.images.map((image, index) => `<img class="product-photo photo-${index + 1}" src="${image}" data-local-fallback="${fallbackByCategory[product.category]}" alt="${product.name}${index ? " em outro ângulo" : ""}" loading="lazy">`).join("")}</a><button class="heart-button ${state.favorites.includes(product.id) ? "is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${state.favorites.includes(product.id) ? "Remover dos" : "Adicionar aos"} favoritos" aria-pressed="${state.favorites.includes(product.id)}">${state.favorites.includes(product.id) ? "♥" : "♡"}</button><span class="silver-badge">Prata ${silverSet}</span></div>
      <div class="product-body"><div class="product-meta"><div><span>${categoryName(product.category)}</span><h3>${product.name}</h3></div><strong class="price">${money(product.price)}</strong></div><p class="product-description">${product.description}</p><div class="product-actions"><a class="add-button" href="/produto.html?id=${product.id}" target="_blank" rel="noopener">Ver produto <span aria-hidden="true">↗</span></a><button class="add-button add-cart" type="button" data-add="${product.id}">Adicionar à sacola</button></div></div>
    </article>`).join("") : `<div class="empty-favorites"><span>♡</span><h3>Sua seleção começa aqui.</h3><p>Toque no coração de uma joia para guardá-la nos favoritos.</p><button type="button" class="secondary-link" id="clearFavoritesFilter">Voltar ao catálogo</button></div>`;
  const clear = $("#clearFavoritesFilter");
  if (clear) clear.addEventListener("click", () => { state.showFavorites = false; $("#favoritesButton").classList.remove("is-active"); renderProducts(); });
}

function categoryName(category) { return ({ corrente: "Colar", pingente: "Pingente", brinco: "Brinco", pulseira: "Pulseira", anel: "Anel", alianca: "Aliança" })[category] || category; }
function saveState() { localStorage.setItem("icegen-cart", JSON.stringify(state.cart)); localStorage.setItem("icegen-favorites", JSON.stringify(state.favorites)); }
function renderCart() {
  $("#cartCount").textContent = state.cart.length;
  $("#cartTotal").textContent = money(state.cart.reduce((sum, item) => sum + item.price, 0));
  $("#cartItems").innerHTML = state.cart.length ? state.cart.map((item, index) => `<div class="cart-row"><img src="${imagePath(item.images?.[0] || "gift-box.png")}" alt="${item.name}"><div><strong>${item.name}</strong><span>${money(item.price)}</span></div><button class="remove" type="button" data-remove="${index}" aria-label="Remover ${item.name}">Remover</button></div>`).join("") : `<div class="cart-empty"><span>✧</span><h3>Sua sacola está esperando.</h3><p>Encontre uma joia para chamar de sua.</p><a href="#produtos" class="secondary-link" id="goCatalog">Explorar joias</a></div>`;
  renderSetSuggestions();
}
function renderSetSuggestions() {
  const cats = new Set(state.cart.map(item => item.category));
  const needed = [...new Set([...cats].flatMap(category => complements[category] || []))].filter(category => !cats.has(category) || category === "brinco");
  const suggestions = needed.flatMap(category => products.filter(product => product.category === category)).slice(0, 3);
  $("#setBuilder").classList.toggle("show", state.cart.length > 0 && suggestions.length > 0);
  $("#setOptions").innerHTML = suggestions.map(product => `<button class="set-option" type="button" data-add="${product.id}"><img src="${product.images[0]}" alt=""><span>${product.name}<strong>${money(product.price)}</strong></span><b>+</b></button>`).join("");
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
  $("#heroEyebrow").textContent = slide.eyebrow; $("#heroTitle").innerHTML = slide.title; $("#heroDescription").textContent = slide.description;
  const image = $("#heroImage"); image.classList.add("is-changing"); window.setTimeout(() => { image.src = slide.image; image.alt = slide.alt; image.classList.remove("is-changing"); }, 160);
  $("#heroIndex").textContent = `${String(state.activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  $("#heroDots").innerHTML = slides.map((item, dot) => `<button type="button" class="hero-dot ${dot === state.activeSlide ? "active" : ""}" data-slide="${dot}" aria-label="Mostrar slide ${dot + 1}" aria-current="${dot === state.activeSlide ? "true" : "false"}"></button>`).join("");
}

const giftChoices = {
  chain: products.filter(item => item.category === "corrente"),
  pendant: products.filter(item => item.category === "pingente"),
  wrap: [{ id: "wrap-paper", name: "Caixa gelo", price: 39, image: "/assets/gift-box.png" }, { id: "wrap-velvet", name: "Estojo veludo", price: 59, image: "/assets/gift-box.png" }]
};
function renderGiftChoices() {
  for (const kind of ["chain", "pendant", "wrap"]) {
    const container = $(`#${kind}Choices`);
    const disabled = kind === "pendant" && !state.gift.chain || kind === "wrap" && !state.gift.pendant;
    container.innerHTML = giftChoices[kind].map(item => `<button class="choice-card ${state.gift[kind] === item.id ? "selected" : ""}" type="button" data-gift-kind="${kind}" data-gift-id="${item.id}" aria-pressed="${state.gift[kind] === item.id}" ${disabled ? "disabled" : ""}><img src="${kind === "wrap" ? item.image : item.images[0]}" data-local-fallback="${kind === "chain" ? "corrente-1.png" : kind === "pendant" ? "pingente-1.png" : "gift-box.png"}" alt=""><span>${item.name}</span><strong>${money(item.price)}</strong><b class="choice-check" aria-hidden="true">✓</b></button>`).join("");
  }
  updateGift();
}
function updateGift() {
  const chain = products.find(item => item.id === state.gift.chain), pendant = products.find(item => item.id === state.gift.pendant), wrap = giftChoices.wrap.find(item => item.id === state.gift.wrap);
  const chainReady = Boolean(chain), pendantReady = Boolean(pendant), wrapReady = Boolean(wrap);
  $("#pendantStep").classList.toggle("is-locked", !chainReady); $("#wrapStep").classList.toggle("is-locked", !pendantReady);
  if (chain) { $("#chainPreview").src = chain.images[0]; $("#chainPreview").alt = chain.name; }
  else { $("#chainPreview").src = giftChoices.chain[0].images[0]; $("#chainPreview").alt = "Prévia de corrente em prata"; }
  if (pendant) { $("#pendantPreview").src = pendant.images[0]; $("#pendantPreview").alt = pendant.name; }
  else { $("#pendantPreview").src = giftChoices.pendant[0].images[0]; $("#pendantPreview").alt = "Prévia de pingente em prata"; }
  const total = (chain?.price || 0) + (pendant?.price || 0) + (wrap?.price || 0);
  $("#giftTotal").textContent = chain && pendant && wrap ? money(total) : "Selecione os itens";
  $("#addGift").disabled = !(chain && pendant && wrap);
  document.querySelectorAll(".choice-card").forEach(button => { const selected = state.gift[button.dataset.giftKind] === button.dataset.giftId; button.classList.toggle("selected", selected); button.setAttribute("aria-pressed", String(selected)); });
  for (const kind of ["chain", "pendant", "wrap"]) {
    const selectedIndex = giftChoices[kind].findIndex(item => item.id === state.gift[kind]);
    const progress = $(`#${kind}Step .step-progress`);
    progress.querySelector("span").textContent = `${selectedIndex < 0 ? 1 : selectedIndex + 1} de ${giftChoices[kind].length}`;
    progress.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("active", index <= (selectedIndex < 0 ? 0 : selectedIndex)));
  }
}
function selectGift(kind, id) {
  if (kind === "pendant" && !state.gift.chain || kind === "wrap" && !state.gift.pendant) return;
  state.gift[kind] = id;
  if (kind === "chain") { state.gift.pendant = null; state.gift.wrap = null; }
  if (kind === "pendant") state.gift.wrap = null;
  renderGiftChoices();
  document.querySelectorAll(".builder-step").forEach(step => step.classList.toggle("is-current", step.id === `${kind}Step`));
  if (kind === "chain") $("#pendantStep").scrollIntoView({ behavior: "smooth", block: "center" });
  if (kind === "pendant") $("#wrapStep").scrollIntoView({ behavior: "smooth", block: "center" });
  if (kind === "wrap") $("#addGift").focus({ preventScroll: true });
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]"), remove = event.target.closest("[data-remove]"), favorite = event.target.closest("[data-favorite]"), gift = event.target.closest("[data-gift-kind]"), slide = event.target.closest("[data-slide]"), filter = event.target.closest("[data-menu-filter]"), combo = event.target.closest("[data-combo-filter]");
  if (add) addToCart(add.dataset.add);
  if (remove) { state.cart.splice(Number(remove.dataset.remove), 1); saveState(); renderCart(); }
  if (favorite) toggleFavorite(favorite.dataset.favorite);
  if (gift) selectGift(gift.dataset.giftKind, gift.dataset.giftId);
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
$("#addGift").addEventListener("click", () => { const chain = products.find(item => item.id === state.gift.chain), pendant = products.find(item => item.id === state.gift.pendant), wrap = giftChoices.wrap.find(item => item.id === state.gift.wrap); if (!chain || !pendant || !wrap) return; state.cart.push({ id: `gift-${Date.now()}`, name: `Presente: ${chain.name} + ${pendant.name} · ${wrap.name}`, category: "presente", price: chain.price + pendant.price + wrap.price, images: ["gift-box.png"] }); saveState(); renderCart(); showToast("Presente adicionado à sacola"); toggleDrawer("cartDrawer", true); });

document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
renderProducts(); renderCart(); renderGiftChoices(); renderSlide(0); updateFavoriteCount();
