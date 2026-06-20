"use client";

import { useState } from "react";
import { openPack } from "@/actions/open-pack";
import type { Card } from "@/types/cards";
import { CardDisplay } from "./CardDisplay";
import { Button } from "@heroui/react";

// =============================================================
// ESTADOS DE LA UI
// =============================================================

type PackState = "idle" | "opening" | "revealed";

// =============================================================
// COMPONENTE
// =============================================================

export function PackAnimation() {
  const [state, setState] = useState<PackState>("idle");
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  async function handleOpenPack() {
    setState("opening");
    setError(null);
    setVisibleCount(0);

    const result = await openPack();

    if (result.error || !result.cards.length) {
      setError(result.error ?? "Error inesperado");
      setState("idle");
      return;
    }

    setCards(result.cards);
    setState("revealed");

    // Revelar las cartas una por una con delay
    result.cards.forEach((_, i) => {
      setTimeout(() => setVisibleCount(i + 1), i * 300);
    });
  }

  function handleReset() {
    setState("idle");
    setCards([]);
    setVisibleCount(0);
  }

  // ── IDLE: botón para abrir sobre ──────────────────────────
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-8xl select-none">📦</div>
        <p className="text-zinc-400 text-sm">Cada sobre contiene 5 cartas</p>
        {/* <button
          onClick={handleOpenPack}
          className="px-8 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-colors"
        >
          Abrir sobre
        </button> */}
        <Button onClick={handleOpenPack}>Abrir sobre</Button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  // ── OPENING: spinner mientras la Server Action responde ───
  if (state === "opening") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl animate-bounce select-none">📦</div>
        <p className="text-zinc-400 text-sm animate-pulse">Abriendo sobre...</p>
      </div>
    );
  }

  // ── REVEALED: muestra las 5 cartas ────────────────────────
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, i) => (
          <div
            key={`${card.id}-${i}`}
            className={`transition-all duration-500 ${
              i < visibleCount
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <CardDisplay card={card} />
          </div>
        ))}
      </div>

      {/* Solo mostrar el botón cuando todas las cartas ya se revelaron */}
      {visibleCount === cards.length && (
        // <button
        //   onClick={handleReset}
        //   className="px-6 py-2.5 rounded-full border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
        // >
        //   Abrir otro sobre
        // </button>
        <Button onClick={handleReset}>Abrir otro sobre</Button>
      )}
    </div>
  );
}
