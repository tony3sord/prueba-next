import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardDisplay } from "@/components/CardDisplay";
import { TeamBuilder } from "@/components/TeamBuilder";
import type { Card, Rarity } from "@/actions/open-pack";
import { Link as HeroLink } from "@heroui/react";
import { getTeam } from "@/actions/team";

export const dynamic = "force-dynamic";

// =============================================================
// TIPOS
// =============================================================

interface UserCard {
  obtained_at: string;
  cards: Card;
}

// =============================================================
// CONFIG — orden de rareza de mayor a menor
// =============================================================

const RARITY_ORDER: Rarity[] = [
  "legendario",
  "epico",
  "raro",
  "infrecuente",
  "comun",
];

const RARITY_LABEL: Record<Rarity, string> = {
  legendario: "Legendario",
  epico: "Épico",
  raro: "Raro",
  infrecuente: "Infrecuente",
  comun: "Común",
};

const RARITY_COLOR: Record<Rarity, string> = {
  legendario: "text-yellow-400",
  epico: "text-purple-400",
  raro: "text-blue-400",
  infrecuente: "text-emerald-400",
  comun: "text-zinc-400",
};

// =============================================================
// PAGE (Server Component)
// =============================================================

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── Cargar colección del usuario con join a cards ──────────
  const { data: userCards, error } = await supabase
    .from("user_cards")
    .select("obtained_at, cards(*)")
    .order("obtained_at", { ascending: false });

  const collection = (userCards ?? []) as unknown as UserCard[];

  // ── Agrupar por rareza ─────────────────────────────────────
  const grouped = collection.reduce<Record<Rarity, Card[]>>(
    (acc, { cards: card }) => {
      acc[card.rarity as Rarity].push(card);
      return acc;
    },
    { legendario: [], epico: [], raro: [], infrecuente: [], comun: [] },
  );

  //Cargar el equipo del user para pasarle al team builder
  const savedTeam = await getTeam();
  const initialTeam = Object.fromEntries(
    savedTeam.map(({ position, card_id }) => [position, card_id]),
  );

  // ── Stats ──────────────────────────────────────────────────
  const total = collection.length;
  const unique = new Set(collection.map(({ cards }) => cards.id)).size;
  const name = user.user_metadata?.name?.split(" ")[0] ?? "Campeón";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40 backdrop-blur-md">
        <HeroLink
          href="/"
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          ← Inicio
        </HeroLink>

        <span className="text-sm font-medium text-white">
          Esta es tu colección, {name}!
        </span>

        <HeroLink
          href="/pack"
          className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Abrir sobre →
        </HeroLink>
      </header>
      <div className="flex flex-col lg:flex-row gap-32 justify-between items-start px-0 py-10 w-full">
        {/* Columna izquierda — colección */}
        <div className="flex flex-col gap-10 flex-1 min-w-0 max-w-2xl pl-16">
          {/* STATS */}
          <section className="flex flex-wrap gap-4">
            <StatCard label="Cartas totales" value={total} />
            <StatCard label="Jugadores únicos" value={unique} />
            <StatCard
              label="Legendarios"
              value={grouped.legendario.length}
              highlight={grouped.legendario.length > 0}
            />
          </section>

          {/* COLECCIÓN VACÍA */}
          {total === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="text-6xl">📦</span>
              <p className="text-zinc-400">Todavía no tenés cartas.</p>
              <Link
                href="/pack"
                className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-colors"
              >
                Abrir primer sobre
              </Link>
            </div>
          )}

          {/* COLECCIÓN AGRUPADA */}
          {RARITY_ORDER.map((rarity) => {
            const cards = grouped[rarity];
            if (!cards.length) return null;
            return (
              <section key={rarity} className="flex flex-col gap-4">
                <div className="flex items-baseline gap-3">
                  <h2 className={`text-lg font-black ${RARITY_COLOR[rarity]}`}>
                    {RARITY_LABEL[rarity]}
                  </h2>
                  <span className="text-zinc-600 text-sm">
                    {cards.length} carta{cards.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-x-48 gap-y-8">
                  {cards.map((card, i) => (
                    <CardDisplay key={`${card.id}-${i}`} card={card} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Columna derecha — campo */}
        <div className="w-full lg:w-[640px] flex-shrink-0 sticky top-6 pr-16">
          <h2 className="text-lg font-black text-white mb-4">Mi 11 ideal</h2>
          <TeamBuilder
            cards={collection.map(({ cards }) => cards)}
            initialTeam={initialTeam}
          />
        </div>
      </div>
    </main>
  );
}

// =============================================================
// SUBCOMPONENTE — stat individual
// =============================================================

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900 rounded-xl px-8 py-4 min-w-28 gap-1">
      <span
        className={`text-3xl font-black ${highlight ? "text-yellow-400" : "text-white"}`}
      >
        {value}
      </span>
      <span className="text-zinc-500 text-xs text-center">{label}</span>
    </div>
  );
}
