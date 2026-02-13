import { supabase } from "./supabase.js";

export async function requireRole(role){
  const { data: { user } } = await supabase.auth.getUser();
  if(!user){
    location.href = "login.html";
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if(profile.role !== role){
    alert("Access denied");
    location.href = "login.html";
  }
}
