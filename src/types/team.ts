import type { Card } from "@/types/cards";

export type TeamSlotId =
  | "por"
  | "dl"
  | "dci"
  | "dcd"
  | "dr"
  | "ml"
  | "mc"
  | "mr"
  | "ewl"
  | "cf"
  | "ewr";

export interface UserTeamSlot {
  position: TeamSlotId;
  card_id: string | null;
}

export interface UserCardRow {
  obtained_at: string;
  cards: Card;
}
