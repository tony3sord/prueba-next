"use client";

import { useState } from "react";
import type { Card, Position, Rarity } from "@/types/cards";
import type { TeamSlotId } from "@/types/team";
import { saveTeamSlot } from "@/actions/team";

// =============================================================
// TIPOS
// =============================================================

interface Slot {
  id: TeamSlotId;
  position: Position; // POR | DEF | MED | DEL
  x: number; // % horizontal sobre el SVG
  y: number; // % vertical sobre el SVG
  label: string; // etiqueta visual del slot
}

const RARITY_COLOR: Record<Rarity, string> = {
  legendario: "#facc15",
  epico: "#a855f7",
  raro: "#60a5fa",
  infrecuente: "#34d399",
  comun: "#71717a",
};

// =============================================================
// FORMACIÓN 4-3-3
// Coordenadas en % del viewBox (100 x 160)
// =============================================================

const SLOTS: Slot[] = [
  // Portero
  { id: "por", position: "POR", x: 50, y: 88, label: "POR" },
  // Defensas
  { id: "dl", position: "DEF", x: 15, y: 68, label: "DEF" },
  { id: "dci", position: "DEF", x: 35, y: 68, label: "DEF" },
  { id: "dcd", position: "DEF", x: 65, y: 68, label: "DEF" },
  { id: "dr", position: "DEF", x: 85, y: 68, label: "DEF" },
  // Mediocampistas
  { id: "ml", position: "MED", x: 20, y: 45, label: "MED" },
  { id: "mc", position: "MED", x: 50, y: 45, label: "MED" },
  { id: "mr", position: "MED", x: 80, y: 45, label: "MED" },
  // Delanteros
  { id: "ewl", position: "DEL", x: 18, y: 20, label: "DEL" },
  { id: "cf", position: "DEL", x: 50, y: 20, label: "DEL" },
  { id: "ewr", position: "DEL", x: 82, y: 20, label: "DEL" },
];

// =============================================================
// COMPONENTE
// =============================================================

interface TeamBuilderProps {
  cards: Card[];
  initialTeam?: Partial<Record<TeamSlotId, string>>; // slotId → card_id (uuid)
}

export function TeamBuilder({ cards, initialTeam = {} }: TeamBuilderProps) {
  const [team, setTeam] = useState<Partial<Record<TeamSlotId, Card>>>(() => {
    const result: Partial<Record<TeamSlotId, Card>> = {};
    for (const [slotId, cardId] of Object.entries(initialTeam)) {
      const card = cards.find((c) => c.id === cardId);
      if (card) result[slotId as TeamSlotId] = card;
    }
    return result;
  });

  // slot activo para el picker
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [savingSlotId, setSavingSlotId] = useState<TeamSlotId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cartas ya usadas en el equipo
  const usedCardIds = new Set(Object.values(team).map((c) => c.id));

  // Cartas únicas por id disponibles para el slot activo
  const availableCards = activeSlot
    ? Array.from(
        new Map(
          cards
            .filter(
              (c) =>
                c.position === activeSlot.position && !usedCardIds.has(c.id),
            )
            .map((c) => [c.id, c]),
        ).values(),
      )
    : [];

  function handleSlotClick(slot: Slot) {
    if (savingSlotId) return;
    setError(null);
    setActiveSlot(slot);
  }

  async function handlePickCard(card: Card) {
    if (!activeSlot) return;

    const slotId = activeSlot.id;
    const previousTeam = team;
    setSavingSlotId(slotId);
    setError(null);
    setTeam((prev) => ({ ...prev, [slotId]: card }));
    setActiveSlot(null);

    try {
      await saveTeamSlot(slotId, card.id);
    } catch (saveError) {
      console.error(saveError);
      setTeam(previousTeam);
      setError("No se pudo guardar el equipo. Intentá nuevamente.");
    } finally {
      setSavingSlotId(null);
    }
  }

  async function handleRemoveCard(slotId: TeamSlotId) {
    const previousTeam = team;
    setSavingSlotId(slotId);
    setError(null);
    setTeam((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });

    try {
      await saveTeamSlot(slotId, null);
    } catch (saveError) {
      console.error(saveError);
      setTeam(previousTeam);
      setError("No se pudo eliminar la carta. Intentá nuevamente.");
    } finally {
      setSavingSlotId(null);
    }
  }

  const filledCount = Object.keys(team).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl mx-auto">
      {/* ── CAMPO SVG ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="relative w-full" style={{ aspectRatio: "10/16" }}>
          <svg
            viewBox="0 0 100 160"
            className="w-full h-full rounded-xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fondo */}
            <rect width="100" height="160" fill="#166534" rx="6" />

            {/* Franjas del césped */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x="0"
                y={i * 20}
                width="100"
                height="10"
                fill="#15803d"
                opacity="0.5"
              />
            ))}

            {/* Borde del campo */}
            <rect
              x="4"
              y="6"
              width="92"
              height="148"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              rx="2"
            />

            {/* Línea del medio */}
            <line
              x1="4"
              y1="80"
              x2="96"
              y2="80"
              stroke="white"
              strokeWidth="0.8"
            />

            {/* Círculo central */}
            <circle
              cx="50"
              cy="80"
              r="12"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="80" r="0.8" fill="white" />

            {/* Área grande — arriba (rival) */}
            <rect
              x="22"
              y="6"
              width="56"
              height="22"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
            {/* Área chica — arriba */}
            <rect
              x="35"
              y="6"
              width="30"
              height="10"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />

            {/* Área grande — abajo (nuestra) */}
            <rect
              x="22"
              y="132"
              width="56"
              height="22"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
            {/* Área chica — abajo */}
            <rect
              x="35"
              y="144"
              width="30"
              height="10"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />

            {/* Punto penal — abajo */}
            <circle cx="50" cy="138" r="0.8" fill="white" />

            {/* ── SLOTS ──────────────────────────────────── */}
            {SLOTS.map((slot) => {
              const card = team[slot.id];
              const cx = slot.x;
              const cy = (slot.y / 100) * 160;
              const isActive = activeSlot?.id === slot.id;

              return (
                <g
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  style={{ cursor: "pointer" }}
                >
                  {card ? (
                    <>
                      {/* Slot con carta */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="6.5"
                        fill={RARITY_COLOR[card.rarity as Rarity]}
                        opacity="0.9"
                        stroke="white"
                        strokeWidth="0.8"
                      />
                      <text
                        x={cx}
                        y={cy - 0.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2.8"
                        fontWeight="bold"
                        style={{ pointerEvents: "none" }}
                      >
                        {card.name.split(" ").pop()}
                      </text>
                      <text
                        x={cx}
                        y={cy + 3.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2"
                        opacity="0.8"
                        style={{ pointerEvents: "none" }}
                      >
                        {card.rating}
                      </text>
                    </>
                  ) : (
                    <>
                      {/* Slot vacío */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="6"
                        fill={
                          isActive
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(255,255,255,0.1)"
                        }
                        stroke="white"
                        strokeWidth="0.8"
                        strokeDasharray={isActive ? "none" : "2,1"}
                      />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2.8"
                        opacity="0.7"
                        style={{ pointerEvents: "none" }}
                      >
                        {slot.label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Contador */}
        <p className="text-center text-zinc-500 text-sm mt-2">
          {filledCount}/11 jugadores
        </p>
      </div>

      {/* ── PANEL LATERAL ──────────────────────────────────── */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        {activeSlot ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">
                Elegí un {activeSlot.label}
              </h3>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-zinc-500 hover:text-white text-sm transition-colors"
              >
                Cerrar ✕
              </button>
            </div>

            {savingSlotId && (
              <p className="text-zinc-400 text-xs">Guardando cambios...</p>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {availableCards.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No tenés {activeSlot.label}s disponibles en tu colección.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {availableCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handlePickCard(card)}
                    disabled={savingSlotId !== null}
                    className={`flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-3 text-left transition-colors ${
                      savingSlotId ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: RARITY_COLOR[card.rarity as Rarity],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {card.name}
                      </p>
                      <p className="text-zinc-500 text-xs">{card.club}</p>
                    </div>
                    <span className="text-zinc-400 text-sm font-bold flex-shrink-0">
                      {card.rating}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-white font-bold">Mi 11 ideal</h3>

            {savingSlotId && (
              <p className="text-zinc-400 text-xs">Guardando cambios...</p>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Lista de elegidos */}
            <div className="flex flex-col gap-2">
              {SLOTS.map((slot) => {
                const card = team[slot.id];
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: card
                          ? RARITY_COLOR[card.rarity as Rarity]
                          : "#3f3f46",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      {card ? (
                        <>
                          <p className="text-white text-sm font-semibold truncate">
                            {card.name}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {slot.label} · {card.rating}
                          </p>
                        </>
                      ) : (
                        <p className="text-zinc-600 text-sm">
                          {slot.label} vacío
                        </p>
                      )}
                    </div>
                    {card && (
                      <button
                        onClick={() => handleRemoveCard(slot.id)}
                        className="text-zinc-600 hover:text-red-400 text-xs transition-colors flex-shrink-0"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
