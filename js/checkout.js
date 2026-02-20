import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit");
  const cartSummary = document.getElementById("cart-summary");
  const cartTotalEl = document.getElementById("cart-total");

  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!cart.length) {
    cartSummary.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cartSummary.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      const div = document.createElement("div");
      div.textContent = `${item.name} x ${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`;
      cartSummary.appendChild(div);
      total += item.price * item.quantity;
    });
    cartTotalEl.textContent = `Total: €${total.toFixed(2)}`;
  }

  submitBtn.addEventListener("click", async () => {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    const paymentInput = document.getElementById("payment");

    // Validation
    if (!nameInput.value || !phoneInput.value || !addressInput.value) {
      alert("Please fill in all fields.");
      return;
    }

    if (!cart.length) {
      alert("Cart is empty!");
      return;
    }

    const order = {
      customer_name: nameInput.value,
      phone: phoneInput.value,
      address: addressInput.value,
      items: cart,
      status: "pending",
      payment_method: paymentInput.value,
      payment_status: paymentInput.value === "cash" ? "pending" : "initiated"
    };

    console.log("Inserting order:", order);

    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Failed to place order. Check console for details.");
      return;
    }

    // WhatsApp notification
    const phoneNumber = "393508912048"; // <-- change to your WhatsApp number
    const msg = encodeURIComponent(
      `New Order!\nName: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}\nItems: ${order.items.map(i => `${i.name} x ${i.quantity}`).join(", ")}\nPayment: ${order.payment_method}`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, "_blank");

    // Clear cart
    localStorage.removeItem("cart");
    alert("Order placed successfully!");
    location.href = "index.html";
  });
});
