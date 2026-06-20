"use client";

import type { Card, Rarity } from "@/actions/open-pack";

// CONFIG DE RAREZA — colores y etiquetas

const RARITY_CONFIG: Record<
  Rarity,
  { label: string; border: string; badge: string; glow: string }
> = {
  legendario: {
    label: "Legendario",
    border: "border-yellow-400",
    badge: "bg-yellow-400 text-black",
    glow: "shadow-yellow-400/50",
  },
  epico: {
    label: "Épico",
    border: "border-purple-500",
    badge: "bg-purple-500 text-white",
    glow: "shadow-purple-500/50",
  },
  raro: {
    label: "Raro",
    border: "border-blue-400",
    badge: "bg-blue-400 text-white",
    glow: "shadow-blue-400/50",
  },
  infrecuente: {
    label: "Infrecuente",
    border: "border-emerald-400",
    badge: "bg-emerald-400 text-white",
    glow: "shadow-emerald-400/50",
  },
  comun: {
    label: "Común",
    border: "border-zinc-500",
    badge: "bg-zinc-500 text-white",
    glow: "shadow-zinc-500/20",
  },
};

const POSITION_LABEL: Record<string, string> = {
  POR: "Portero",
  DEF: "Defensor",
  MED: "Mediocampista",
  DEL: "Delantero",
};

// COMPONENTE

interface CardDisplayProps {
  card: Card;
  /** Si es true, la carta aparece con una animación de entrada */
  animate?: boolean;
}

export function CardDisplay({ card, animate = true }: CardDisplayProps) {
  const config = RARITY_CONFIG[card.rarity];

  return (
    <div
      className={`
        relative flex flex-col justify-between
        w-44 min-h-64 rounded-xl border-2 p-4
        bg-zinc-900 text-white
        shadow-lg ${config.glow}
        ${config.border}
        ${animate ? "animate-fade-in" : ""}
        transition-transform duration-200 hover:scale-105
      `}
    >
      {/* Rareza */}
      <span
        className={`self-start text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}
      >
        {config.label}
      </span>

      {/* Imagen del jugador */}
      <div className="flex justify-center my-2">
        <img
          src={card.imagen_url}
          alt={card.name}
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Nombre y posición */}
      <div className="mt-3 flex-1">
        <p className="text-lg font-extrabold leading-tight">{card.name}</p>
        <p className="text-xs text-zinc-400 mt-1">
          {POSITION_LABEL[card.position] ?? card.position}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{card.club}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 flex justify-between text-center">
        <div>
          <p className="text-xl font-black">{card.rating}</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
            Rating
          </p>
        </div>
        {card.goals_in_wc > 0 && (
          <div>
            <p className="text-xl font-black">{card.goals_in_wc}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
              Goles
            </p>
          </div>
        )}
      </div>

      {/* Bandera Argentina — detalle visual */}
      <div className="absolute top-3 right-3 text-lg">🇦🇷</div>
    </div>
  );
}
