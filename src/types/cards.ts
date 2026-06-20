export type Position = "POR" | "DEF" | "MED" | "DEL";

export type Rarity = "legendario" | "epico" | "raro" | "infrecuente" | "comun";

export interface Card {
  imagen_url: string;
  id: string;
  name: string;
  position: Position;
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
