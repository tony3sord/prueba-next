import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PackAnimation } from "@/components/PackAnimation";

// Forzar renderizado dinámico — nunca cachear una página con sesión
export const dynamic = "force-dynamic";

// =============================================================
// PAGE (Server Component — protege la ruta y pasa el nombre)
// =============================================================

export default async function PackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Nombre para el saludo — Google Auth suele traerlo en user_metadata
  const name = user.user_metadata?.name?.split(" ")[0] ?? "Campeón";

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
        <Link
          href="/"
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          ← Inicio
        </Link>

        <span className="text-sm text-zinc-400">
          Hola, <span className="text-white font-medium">{name}</span> 🇦🇷
        </span>

        <Link
          href="/profile"
          className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium"
        >
          Mi colección →
        </Link>
      </header>

      {/* ── CONTENIDO ────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-16 gap-4">
        <h1 className="text-3xl font-black text-center">
          Abre tu sobre y probemos suerte
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          5 cartas por sobre · probabilidades reales
        </p>

        {/* PackAnimation es Client Component — maneja toda la interacción */}
        <PackAnimation />
      </section>
    </main>
  );
}
