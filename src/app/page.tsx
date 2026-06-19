import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya está logueado va directo a abrir sobres (/pack), si no a login
  const ctaHref = user ? "/pack" : "/login";

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center gap-6">
        <span className="text-8xl mb-2">🇦🇷</span>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
          Argentina <br />
          <span className="text-sky-400">Qatar 2022</span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-sm leading-relaxed">
          Abre sobres y arma tu colección con los 26 campeones del mundo. Cada
          sobre trae 5 cartas — ¿te sale la carta de su santidad Lionel Messi?
        </p>

        <Link
          href={ctaHref}
          className="mt-4 px-10 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-colors"
        >
          {user ? "Abrir sobre" : "Empezar"}
        </Link>

        {user && (
          <Link
            href="/profile"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Ver mi colección
          </Link>
        )}
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="text-center pb-8 text-zinc-700 text-xs">
        26 jugadores · Mundial Qatar 2022
      </footer>
    </main>
  );
}
