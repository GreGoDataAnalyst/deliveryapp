import { supabase } from "./supabase.js";
import { requireRole } from "./auth.js";

await requireRole("admin");

const list = document.getElementById("menuList");
const nameEl = document.getElementById("name");
const priceEl = document.getElementById("price");
const imageEl = document.getElementById("image");
const descEl = document.getElementById("description");

/* ADD MENU ITEM */
document.getElementById("addBtn").onclick = async () => {
  if (!nameEl.value || !priceEl.value) {
    alert("Name and price required");
    return;
  }

  const { error } = await supabase.from("menu").insert({
    name: nameEl.value,
    price: priceEl.value,
    image_url: imageEl.value,
    description: descEl.value
  });

  if (error) {
    alert(error.message);
    return;
  }

  nameEl.value = priceEl.value = imageEl.value = descEl.value = "";
  loadMenu();
};

/* LOAD MENU */
async function loadMenu() {
  list.innerHTML = "";

  const { data } = await supabase.from("menu").select("*");

  data.forEach(item => {
    const div = document.createElement("article");

    div.innerHTML = `
      <strong>${item.name}</strong> – €${item.price}
      <p>${item.description || ""}</p>
      <button class="delete">Delete</button>
    `;

    div.querySelector(".delete").onclick = async () => {
      await supabase.from("menu").delete().eq("id", item.id);
      loadMenu();
    };

    list.appendChild(div);
  });
}

loadMenu();
