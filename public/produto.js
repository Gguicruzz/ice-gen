const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const products = [
  {
    id: "corrente-veneziana",
    name: "Corrente Veneziana 45 cm",
    price: 189
  }
];

const product = products.find(product => product.id === productId);

if (product) {
  const productName = document.querySelector("#product-name");
  const productPrice = document.querySelector("#product-price");

  productName.textContent = product.name;
  productPrice.textContent = `R$ ${product.price.toFixed(2).replace(".", ",")}`;
}