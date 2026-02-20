import { supabase } from "./supabase.js";
import { requireRole } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {


  await requireRole("rider");

  const ordersDiv = document.getElementById("orders");
  const dateInput = document.getElementById("orderDate");
  const filterBtn = document.getElementById("filterBtn");

  const today = new Date().toISOString().split("T")[0];
  if (dateInput) dateInput.value = today;

  async function loadMyOrders(date) {

    ordersDiv.innerHTML = "Loading deliveries...";

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", date + " 00:00:00")
      .lte("created_at", date + " 23:59:59")
      .order("created_at", { ascending: false });

    if (error) {
      ordersDiv.innerHTML = "Error loading deliveries";
      return;
    }

    if (!data || !data.length) {
      ordersDiv.innerHTML = "No deliveries for this date";
      return;
    }

    ordersDiv.innerHTML = "";

    data.forEach(order => {

      const article = document.createElement("article");

      article.innerHTML = `
        <strong>${order.customer_name}</strong><br>
        📞 ${order.phone}<br>
        📍 ${order.address}<br>
        💳 ${order.payment_method} (${order.payment_status})<br>

        <label>Status</label>
        <select class="status">
          <option value="out_for_delivery">out_for_delivery</option>
          <option value="delivered">delivered</option>
        </select>

        <small>${new Date(order.created_at).toLocaleString()}</small>
        <hr>
      `;

      const statusSelect = article.querySelector(".status");
      statusSelect.value = order.status;

      statusSelect.onchange = async () => {
        await supabase
          .from("orders")
          .update({ status: statusSelect.value })
          .eq("id", order.id);
      };

      ordersDiv.appendChild(article);
    });
  }

  loadMyOrders(today);

  if (filterBtn) {
    filterBtn.onclick = () => {
      loadMyOrders(dateInput.value);
    };
  }

});
