import { supabase } from "./supabase.js";

const menuEl = document.getElementById("menu");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartPopup = document.getElementById("cart-popup");
const cartItemsEl = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkoutBtn");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

/* ===== CART UTILS ===== */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateCheckoutState();
}

function updateCartCount() {
  cartCountEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function updateCheckoutState() {
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);

  if (totalQty === 0) {
    checkoutBtn.classList.add("secondary");
    checkoutBtn.setAttribute("aria-disabled", "true");
    checkoutBtn.onclick = e => e.preventDefault();
  } else {
    checkoutBtn.classList.remove("secondary");
    checkoutBtn.removeAttribute("aria-disabled");
    checkoutBtn.onclick = null;
  }
}

function renderCartPopup() {
  cartItemsEl.innerHTML = "";

  if (!cart.length) {
    cartItemsEl.innerHTML = "<p>Cart is empty</p>";
    updateCheckoutState();
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <span>${item.name}</span>
      <div class="cart-actions">
        <button class="minus">−</button>
        <strong>${item.quantity}</strong>
        <button class="plus">+</button>
      </div>
    `;

    row.querySelector(".plus").onclick = () => {
      item.quantity++;
      saveCart();
      renderCartPopup();
    };

    row.querySelector(".minus").onclick = () => {
      item.quantity--;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== item.id);
      }
      saveCart();
      renderCartPopup();
    };

    cartItemsEl.appendChild(row);
  });

  updateCheckoutState();
}

/* ===== CART TOGGLE ===== */

cartBtn.onclick = () => {
  cartPopup.style.display =
    cartPopup.style.display === "block" ? "none" : "block";
  renderCartPopup();
};

/* ===== LOAD MENU ===== */

const { data: menuItems } = await supabase.from("menu").select("*");

menuItems.forEach(item => {
  const card = document.createElement("article");
  const existing = cart.find(i => i.id === item.id);
  const qty = existing ? existing.quantity : 0;

  card.innerHTML = `
    <img src="${item.image_url}">
    <h3>${item.name}</h3>
    <p>${item.description}</p>
    <strong>€${item.price}</strong>

    <div class="qty-controls">
      <button class="dec">−</button>
      <span class="qty">${qty}</span>
      <button class="inc">+</button>
    </div>
  `;

  const qtyEl = card.querySelector(".qty");

  card.querySelector(".inc").onclick = () => {
    const found = cart.find(i => i.id === item.id);
    if (found) found.quantity++;
    else cart.push({ ...item, quantity: 1 });

    qtyEl.textContent = found ? found.quantity : 1;
    saveCart();
  };

  card.querySelector(".dec").onclick = () => {
    const found = cart.find(i => i.id === item.id);
    if (!found) return;

    found.quantity--;
    if (found.quantity <= 0) {
      cart = cart.filter(i => i.id !== item.id);
      qtyEl.textContent = 0;
    } else {
      qtyEl.textContent = found.quantity;
    }

    saveCart();
  };

  menuEl.appendChild(card);
});

/* INIT */
updateCartCount();
updateCheckoutState();
