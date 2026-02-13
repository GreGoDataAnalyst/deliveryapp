const cartList = document.getElementById("cart");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

if (cart.length === 0) {
  cartList.innerHTML = "<li>Your cart is empty</li>";
}

cart.forEach((item, index) => {
  const li = document.createElement("li");
  li.innerHTML = `
    ${item.name} - €${item.price}
    <button data-index="${index}">❌</button>
  `;
  cartList.appendChild(li);
});

// Remove item
cartList.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    cart.splice(e.target.dataset.index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
  }
});
