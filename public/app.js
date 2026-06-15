const products = [
  { id: "corrente-veneziana", name: "Corrente Veneziana 45 cm", category: "corrente", price: 189, images: ["corrente-1.png", "corrente-2.png", "corrente-3.png"] },
  { id: "corrente-cartier", name: "Corrente Elo Cartier 60 cm", category: "corrente", price: 249, images: ["cartier-1.png", "cartier-2.png", "cartier-3.png"] },
  { id: "pingente-luz", name: "Pingente Ponto de Luz", category: "pingente", price: 119, images: ["pingente-1.png", "pingente-2.png", "pingente-3.png"] },
  { id: "pingente-coracao", name: "Pingente Coracao Polido", category: "pingente", price: 99, images: ["coracao-1.png", "coracao-2.png", "coracao-3.png"] },
  { id: "brinco-argola", name: "Brinco Argola Fina", category: "brinco", price: 139, images: ["brinco-1.png", "brinco-2.png", "brinco-3.png"] },
  { id: "brinco-gota", name: "Brinco Gota Cristal", category: "brinco", price: 159, images: ["gota-1.png", "gota-2.png", "gota-3.png"] },
  { id: "pulseira-riviera", name: "Pulseira Riviera Prata", category: "pulseira", price: 219, images: ["pulseira-1.png", "pulseira-2.png", "pulseira-3.png"] },
  { id: "pulseira-elo", name: "Pulseira Elo Portugues", category: "pulseira", price: 179, images: ["elo-1.png", "elo-2.png", "elo-3.png"] },
  { id: "anel-liso", name: "Anel Liso Espelhado", category: "anel", price: 149, images: ["anel-1.png", "anel-2.png", "anel-3.png"] },
  { id: "alianca-classica", name: "Alianca Classica 4 mm", category: "alianca", price: 199, images: ["alianca-1.png", "alianca-2.png", "alianca-3.png"] }
];

const complementMap = {
  corrente: ["pingente"],
  pingente: ["corrente", "pulseira"],
  brinco: ["brinco"],
  pulseira: ["pingente"],
  anel: ["alianca"],
  alianca: ["anel"]
};

const formatMoney = value => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
}).format(value);

const state = {
  cart: [],
  filter: "todos"
};

const productGrid = document.querySelector("#productGrid");
const cartButton = document.querySelector("#cartButton");
const cartDrawer = document.querySelector("#cartDrawer");
const closeCart = document.querySelector("#closeCart");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const setBuilder = document.querySelector("#setBuilder");
const setOptions = document.querySelector("#setOptions");
const skipSet = document.querySelector("#skipSet");
const checkout = document.querySelector("#checkout");
const chainSelect = document.querySelector("#chainSelect");
const pendantSelect = document.querySelector("#pendantSelect");
const wrapSelect = document.querySelector("#wrapSelect");
const chainPreview = document.querySelector("#chainPreview");
const pendantPreview = document.querySelector("#pendantPreview");
const wrapPreview = document.querySelector("#wrapPreview");
const giftTotal = document.querySelector("#giftTotal");
const addGift = document.querySelector("#addGift");
const jewelryMenuButton = document.querySelector("#jewelryMenuButton");
const jewelryMenu = document.querySelector("#jewelryMenu");
const contactButton = document.querySelector("#contactButton");
const contactPopover = document.querySelector("#contactPopover");
const loginButton = document.querySelector("#loginButton");
const loginModal = document.querySelector("#loginModal");
const closeLogin = document.querySelector("#closeLogin");
const loginForm = document.querySelector("#loginForm");
const loginStatus = document.querySelector("#loginStatus");
const megaContactButton = document.querySelector("#megaContactButton");

function imagePath(name) {
  return `/assets/${name}`;
}

function renderProducts() {
  const visible = state.filter === "todos"
    ? products
    : products.filter(product => product.category === state.filter);

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-media">
        ${product.images.map(image => `<img src="${imagePath(image)}" alt="${product.name}">`).join("")}
      </div>
      <div class="product-body">
        <div class="product-meta">
          <div>
            <span>${product.category}</span>
            <h3>${product.name}</h3>
          </div>
          <strong class="price">${formatMoney(product.price)}</strong>
        </div>
        <button class="add-button" type="button" data-add="${product.id}">Adicionar ao carrinho</button>
      </div>
    </article>
  `).join("");
}

function applyFilter(filter) {
  document.querySelectorAll(".filter").forEach(item => {
    item.classList.toggle("active", item.dataset.filter === filter);
  });
  state.filter = filter;
  renderProducts();
}

function renderCart() {
  cartCount.textContent = state.cart.length;
  cartTotal.textContent = formatMoney(state.cart.reduce((sum, item) => sum + item.price, 0));

  if (!state.cart.length) {
    cartItems.innerHTML = `<p>Seu carrinho esta vazio.</p>`;
    setBuilder.classList.remove("show");
    return;
  }

  cartItems.innerHTML = state.cart.map((item, index) => `
    <div class="cart-row">
      <img src="${imagePath(item.images[0])}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <span>${formatMoney(item.price)}</span>
      </div>
      <button class="remove" type="button" data-remove="${index}">Remover</button>
    </div>
  `).join("");

  renderSetSuggestions();
}

function renderSetSuggestions() {
  const categoriesInCart = new Set(state.cart.map(item => item.category));
  const needed = [...categoriesInCart].flatMap(category => complementMap[category] || []);
  const uniqueNeeded = [...new Set(needed)].filter(category => !categoriesInCart.has(category) || category === "brinco");
  const suggestions = uniqueNeeded
    .flatMap(category => products.filter(product => product.category === category))
    .slice(0, 4);

  if (!suggestions.length) {
    setBuilder.classList.remove("show");
    return;
  }

  setBuilder.classList.add("show");
  setOptions.innerHTML = suggestions.map(product => `
    <button class="set-option" type="button" data-add="${product.id}">
      <span>${product.name}</span>
      <strong>${formatMoney(product.price)}</strong>
    </button>
  `).join("");
}

function addToCart(productId, open = true) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  state.cart.push(product);
  renderCart();
  if (open) toggleCart(true);
}

function toggleCart(force) {
  const shouldOpen = typeof force === "boolean" ? force : !cartDrawer.classList.contains("open");
  cartDrawer.classList.toggle("open", shouldOpen);
  cartDrawer.setAttribute("aria-hidden", String(!shouldOpen));
}

function toggleMenu(force) {
  const shouldOpen = typeof force === "boolean" ? force : !jewelryMenu.classList.contains("open");
  jewelryMenu.classList.toggle("open", shouldOpen);
  jewelryMenu.setAttribute("aria-hidden", String(!shouldOpen));
  jewelryMenuButton.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) toggleContact(false);
}

function toggleContact(force) {
  const shouldOpen = typeof force === "boolean" ? force : !contactPopover.classList.contains("open");
  contactPopover.classList.toggle("open", shouldOpen);
  contactPopover.setAttribute("aria-hidden", String(!shouldOpen));
  contactButton.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) toggleMenu(false);
}

function toggleLogin(force) {
  const shouldOpen = typeof force === "boolean" ? force : !loginModal.classList.contains("open");
  loginModal.classList.toggle("open", shouldOpen);
  loginModal.setAttribute("aria-hidden", String(!shouldOpen));
  if (shouldOpen) {
    loginStatus.textContent = "";
    document.querySelector("#emailInput").focus();
  }
}

function populateBuilder() {
  const chains = products.filter(product => product.category === "corrente");
  const pendants = products.filter(product => product.category === "pingente");
  chainSelect.innerHTML = chains.map(product => `<option value="${product.id}">${product.name} - ${formatMoney(product.price)}</option>`).join("");
  pendantSelect.innerHTML = pendants.map(product => `<option value="${product.id}">${product.name} - ${formatMoney(product.price)}</option>`).join("");
  updateGiftTotal();
}

function updateGiftTotal() {
  const chain = products.find(product => product.id === chainSelect.value);
  const pendant = products.find(product => product.id === pendantSelect.value);
  const wrap = Number(wrapSelect.selectedOptions[0].dataset.price);
  giftTotal.textContent = formatMoney((chain?.price || 0) + (pendant?.price || 0) + wrap);
  if (chain) {
    chainPreview.src = imagePath(chain.images[0]);
    chainPreview.alt = `Imagem de ${chain.name}`;
  }
  if (pendant) {
    pendantPreview.src = imagePath(pendant.images[0]);
    pendantPreview.alt = `Imagem de ${pendant.name}`;
  }
  wrapPreview.alt = `Imagem da embalagem ${wrapSelect.value}`;
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
  });
});

document.querySelectorAll("[data-menu-filter]").forEach(button => {
  button.addEventListener("click", () => {
    applyFilter(button.dataset.menuFilter);
    toggleMenu(false);
    document.querySelector("#produtos").scrollIntoView({ block: "start" });
  });
});

document.addEventListener("click", event => {
  const addTarget = event.target.closest("[data-add]");
  const removeTarget = event.target.closest("[data-remove]");

  if (addTarget) {
    addToCart(addTarget.dataset.add);
  }

  if (removeTarget) {
    state.cart.splice(Number(removeTarget.dataset.remove), 1);
    renderCart();
  }

  if (!event.target.closest(".menu-wrap") && event.target !== jewelryMenuButton) {
    toggleMenu(false);
  }

  if (!event.target.closest("#contactPopover") && event.target !== contactButton) {
    toggleContact(false);
  }
});

cartButton.addEventListener("click", () => toggleCart(true));
closeCart.addEventListener("click", () => toggleCart(false));
cartDrawer.addEventListener("click", event => {
  if (event.target === cartDrawer) toggleCart(false);
});
jewelryMenuButton.addEventListener("click", event => {
  event.stopPropagation();
  toggleMenu();
});
contactButton.addEventListener("click", event => {
  event.stopPropagation();
  toggleContact();
});
loginButton.addEventListener("click", () => toggleLogin(true));
closeLogin.addEventListener("click", () => toggleLogin(false));
loginModal.addEventListener("click", event => {
  if (event.target === loginModal) toggleLogin(false);
});
loginForm.addEventListener("submit", event => {
  event.preventDefault();
  const email = new FormData(loginForm).get("email");
  loginStatus.textContent = `Login preparado para ${email}.`;
});
megaContactButton.addEventListener("click", () => {
  toggleMenu(false);
  toggleContact(true);
});

skipSet.addEventListener("click", () => {
  setBuilder.classList.remove("show");
});

checkout.addEventListener("click", () => {
  const message = state.cart.length
    ? "Pedido pronto para finalizar. O proximo passo pode ser integrar WhatsApp, checkout ou pagamento."
    : "Adicione uma joia ao carrinho antes de finalizar.";
  alert(message);
});

[chainSelect, pendantSelect, wrapSelect].forEach(select => {
  select.addEventListener("change", updateGiftTotal);
});

addGift.addEventListener("click", () => {
  const chain = products.find(product => product.id === chainSelect.value);
  const pendant = products.find(product => product.id === pendantSelect.value);
  const wrapPrice = Number(wrapSelect.selectedOptions[0].dataset.price);
  const wrapName = wrapSelect.value;
  state.cart.push({
    id: `presente-${Date.now()}`,
    name: `Presente: ${chain.name} + ${pendant.name}`,
    category: "presente",
    price: chain.price + pendant.price + wrapPrice,
    images: ["gift-box.png"],
    wrapName
  });
  renderCart();
  toggleCart(true);
});

renderProducts();
populateBuilder();
renderCart();
