import { supabase } from "./supabase.js";
import { requireRole } from "./auth.js";

await requireRole("rider");

const { data: { user } } = await supabase.auth.getUser();

const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .eq("rider_id", user.id);

orders.forEach(o => {
  const el = document.createElement("article");
  el.innerHTML = `
    <p>${o.address}</p>
    <button>Delivered</button>
  `;
  el.querySelector("button").onclick = () =>
    supabase.from("orders").update({ status: "delivered" }).eq("id", o.id);
  list.appendChild(el);
});
