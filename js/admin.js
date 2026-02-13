import { supabase } from "./supabase.js";
import { requireRole } from "./auth.js";

/* 🔐 Protect page (ADMIN ONLY) */
await requireRole("admin");

const ordersDiv = document.getElementById("orders");
const dateInput = document.getElementById("orderDate");
const filterBtn = document.getElementById("filterBtn");

/* 📅 TODAY DEFAULT */
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;

/* 👤 LOAD RIDERS */
async function loadRiders() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "rider");

  if (error) {
    console.error("Error loading riders:", error);
    return [];
  }

  return data || [];
}

/* 📦 LOAD ORDERS */
async function loadOrders(date) {
  ordersDiv.innerHTML = "Loading orders...";

  const { data: orders, error } = await supabase
    .rpc("get_orders_by_date", { order_date: date });

  if (error) {
    console.error(error);
    ordersDiv.innerHTML = "Error loading orders";
    return;
  }

  if (!orders || orders.length === 0) {
    ordersDiv.innerHTML = "No orders for this date";
    return;
  }

  const riders = await loadRiders();
  ordersDiv.innerHTML = "";

  orders.forEach(order => {
    const article = document.createElement("article");

    article.innerHTML = `
      <strong>${order.customer_name}</strong><br>
      📞 ${order.phone}<br>
      📍 ${order.address}<br>

      <label>Payment Method</label>
      <select class="payment-method">
        <option value="cash">cash</option>
        <option value="mobile_money">mobile_money</option>
        <option value="card">card</option>
      </select>

      <label>Payment Status</label>
      <select class="payment-status">
        <option value="pending">pending</option>
        <option value="paid">paid</option>
        <option value="failed">failed</option>
      </select>

      <label>Order Status</label>
      <select class="status">
        <option value="pending">pending</option>
        <option value="out_for_delivery">out_for_delivery</option>
        <option value="delivered">delivered</option>
      </select>

      <div class="rider-select" style="display:none;">
        <label>Assign Rider</label>
        <select class="rider">
          <option value="">Select rider</option>
          ${riders
            .map(r => `<option value="${r.id}">${r.full_name}</option>`)
            .join("")}
        </select>
      </div>

      <small>${new Date(order.created_at).toLocaleString()}</small>
    `;

    /* 🔗 ELEMENT REFERENCES */
    const statusSelect = article.querySelector(".status");
    const riderBox = article.querySelector(".rider-select");
    const riderSelect = article.querySelector(".rider");
    const paymentMethodSelect = article.querySelector(".payment-method");
    const paymentStatusSelect = article.querySelector(".payment-status");

    /* 🎯 SET CURRENT VALUES */
    statusSelect.value = order.status;
    paymentMethodSelect.value = order.payment_method;
    paymentStatusSelect.value = order.payment_status;

    if (order.status === "out_for_delivery") {
      riderBox.style.display = "block";
      riderSelect.value = order.rider_id || "";
    }

    /* 🔄 ORDER STATUS CHANGE */
    statusSelect.onchange = async () => {
      const newStatus = statusSelect.value;

      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      if (newStatus === "out_for_delivery") {
        riderBox.style.display = "block";
      } else {
        riderBox.style.display = "none";
        await supabase
          .from("orders")
          .update({ rider_id: null })
          .eq("id", order.id);
      }
    };

    /* 🚴 ASSIGN RIDER */
    riderSelect.onchange = async () => {
      await supabase
        .from("orders")
        .update({ rider_id: riderSelect.value || null })
        .eq("id", order.id);
    };

    /* 💳 PAYMENT METHOD */
    paymentMethodSelect.onchange = async () => {
      await supabase
        .from("orders")
        .update({ payment_method: paymentMethodSelect.value })
        .eq("id", order.id);
    };

    /* ✅ PAYMENT STATUS */
    paymentStatusSelect.onchange = async () => {
      await supabase
        .from("orders")
        .update({ payment_status: paymentStatusSelect.value })
        .eq("id", order.id);
    };

    ordersDiv.appendChild(article);
  });
}

/* 🚀 INITIAL LOAD */
loadOrders(today);

/* 🔍 FILTER BY DATE */
filterBtn.onclick = () => loadOrders(dateInput.value);
