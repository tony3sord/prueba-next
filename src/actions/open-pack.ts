"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================================
// TIPOS
// =============================================================

export type Rarity = "legendario" | "epico" | "raro" | "infrecuente" | "comun";

export interface Card {
  id: string;
  name: string;
  position: string;
  club: string;
  rarity: Rarity;
  rarity_probability: number;
  rating: number;
  goals_in_wc: number;
}

export interface OpenPackResult {
  cards: Card[];
  error?: string;
}

// TABLA DE PROBABILIDADES
//
// Se acumulan para poder comparar contra Math.random() (0 a 1):
//   0.00 – 0.01  → legendario
//   0.01 – 0.05  → epico
//   0.05 – 0.15  → raro
//   0.15 – 0.40  → infrecuente
//   0.40 – 1.00  → comun

const RARITY_THRESHOLDS: { rarity: Rarity; threshold: number }[] = [
  { rarity: "legendario", threshold: 0.01 },
  { rarity: "epico", threshold: 0.05 },
  { rarity: "raro", threshold: 0.15 },
  { rarity: "infrecuente", threshold: 0.4 },
  { rarity: "comun", threshold: 1.0 },
];

const CARDS_PER_PACK = 5;

// =============================================================
// HELPERS
// =============================================================

/**
 * Elige un tier de rareza basado en probabilidad ponderada.
 * Genera un número aleatorio entre 0 y 1, y lo compara contra
 * los umbrales acumulados hasta encontrar el primer tier que lo supere.
 */
function pickRarity(): Rarity {
  const roll = Math.random();
  for (const { rarity, threshold } of RARITY_THRESHOLDS) {
    if (roll < threshold) return rarity;
  }
  return "comun"; // fallback por seguridad
}

/**
 * Elige una carta aleatoria del pool del tier indicado.
 */
function pickRandomCard(pool: Card[]): Card {
  return pool[Math.floor(Math.random() * pool.length)];
}

// =============================================================
// SERVER ACTION PRINCIPAL
// =============================================================

export async function openPack(): Promise<OpenPackResult> {
  const supabase = await createClient();

  // ── 1. Validar sesión ──────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { cards: [], error: "No autenticado" };
  }

  // ── 2. Cargar todo el catálogo de cartas ──────────────────
  //    (son solo 26 filas, una sola query es más que suficiente)
  const { data: allCards, error: cardsError } = await supabase
    .from("cards")
    .select("*");

  if (cardsError || !allCards?.length) {
    return { cards: [], error: "No se pudieron cargar las cartas" };
  }

  // ── 3. Agrupar por rareza para búsqueda rápida ────────────
  const cardsByRarity = allCards.reduce<Record<Rarity, Card[]>>(
    (acc, card) => {
      acc[card.rarity as Rarity].push(card);
      return acc;
    },
    { legendario: [], epico: [], raro: [], infrecuente: [], comun: [] },
  );

  // ── 4. Generar 5 cartas con probabilidad ponderada ────────
  const drawnCards: Card[] = [];

  for (let i = 0; i < CARDS_PER_PACK; i++) {
    const rarity = pickRarity();
    const pool = cardsByRarity[rarity];

    // Si el tier salió vacío (no debería pasar), caemos a común
    const card =
      pool.length > 0
        ? pickRandomCard(pool)
        : pickRandomCard(cardsByRarity["comun"]);

    drawnCards.push(card);
  }

  // ── 5. Guardar las cartas en la colección del usuario ─────
  const userCardsToInsert = drawnCards.map((card) => ({
    user_id: user.id,
    card_id: card.id,
  }));

  const { error: insertError } = await supabase
    .from("user_cards")
    .insert(userCardsToInsert);

  if (insertError) {
    return { cards: [], error: "Error al guardar las cartas" };
  }

  // ── 6. Devolver las cartas al cliente ─────────────────────
  return { cards: drawnCards };
}
