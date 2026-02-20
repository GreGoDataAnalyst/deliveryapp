import { supabase } from "./supabase.js";
import { requireRole } from "./auth.js";

await requireRole("admin");

/* =========================
   CREATE RIDER
========================= */

const btn = document.getElementById("createRider");

btn.onclick = async () => {

  const full_name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  if (!full_name || !email|| !phone || !password) {
    alert("Fill all fields");
    return;
  }

  /* Save current admin session */
  const {
    data: { session: adminSession }
  } = await supabase.auth.getSession();

  /* Create rider account */
  const { data, error } = await supabase.auth.signUp({
    email,
    phone,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  const riderId = data.user.id;


  /* Insert rider profile */
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: riderId,
      full_name,
      phone,
      email,
      role: "rider"
    });

  if (profileError) {
    alert(profileError.message);
    return;
  }

  /* Restore admin session */
  await supabase.auth.setSession(adminSession);

  alert("Rider created successfully!");

  loadRiders(); // 🔥 reload table automatically
};


/* =========================
   LOAD ALL RIDERS
========================= */

async function loadRiders() {

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "rider")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const table = document.getElementById("rider-list");
  if (!table) return;

  table.innerHTML = "";

  data.forEach(rider => {
    table.innerHTML += `
      <tr>
        <td>${rider.full_name}</td>
        <td>${rider.phone || ""}</td>
        <td>
          <button onclick="editRider('${rider.id}', '${rider.full_name}')">Edit</button>
          <button onclick="deleteRider('${rider.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}


/* =========================
   EDIT RIDER
========================= */

window.editRider = async (id, currentName) => {

  const newName = prompt("Edit Rider Name:", currentName);
  if (!newName) return;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: newName})
    .eq("id", id);  

  if (error) {
    alert(error.message);
    return;
  }

  alert("Rider updated");
  loadRiders();
};


/* =========================
   DELETE RIDER
========================= */

window.deleteRider = async (id) => {

  if (!confirm("Delete this rider?")) return;

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Rider deleted");
  loadRiders();
};


/* =========================
   LOAD ON PAGE START
========================= */

loadRiders();