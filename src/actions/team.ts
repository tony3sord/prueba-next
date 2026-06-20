"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getTeam() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_team")
    .select("position, card_id")
    .eq("user_id", user.id);

  return data ?? [];
}

// ← Server Action: para guardar/eliminar desde el cliente
export async function saveTeamSlot(position: string, cardId: string | null) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  if (cardId === null) {
    await supabase
      .from("user_team")
      .delete()
      .eq("user_id", user.id)
      .eq("position", position);
  } else {
    await supabase.from("user_team").upsert(
      {
        user_id: user.id,
        position,
        card_id: cardId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,position" },
    );
  }
}
