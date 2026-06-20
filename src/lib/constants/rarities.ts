export type Rarity = {
  label: string;
  probability: string;
  color: string;
};

export const RARITIES: Rarity[] = [
  {
    label: "Legendario",
    probability: "1%",
    color: "border-yellow-400 text-yellow-400",
  },
  {
    label: "Épico",
    probability: "4%",
    color: "border-purple-500 text-purple-400",
  },
  {
    label: "Raro",
    probability: "10%",
    color: "border-blue-400   text-blue-400",
  },
  {
    label: "Infrecuente",
    probability: "25%",
    color: "border-emerald-400 text-emerald-400",
  },
  {
    label: "Común",
    probability: "60%",
    color: "border-zinc-500   text-zinc-400",
  },
];
