"use server";

import { redirect } from "next/navigation";

import { creaClientSupabaseServer } from "@/lib/supabase/server";

export async function esci() {
  const supabase = await creaClientSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
