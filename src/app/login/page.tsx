import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginButton } from "./LoginButton";

// =============================================================
// PAGE (Server Component — redirige si ya hay sesión)
// =============================================================

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya está logueado no tiene nada que hacer acá
  if (user) redirect("/pack");

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo / ícono */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-6xl">🇦🇷</span>
          <h1 className="text-3xl font-black">Argentina Qatar 2022</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Iniciá sesión para abrir sobres y guardar tu colección.
          </p>
        </div>

        {/* Card de login */}
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            Acceder con
          </p>

          {/* Client Component — necesita el browser para OAuth */}
          <LoginButton />
        </div>

        {resolvedSearchParams.error ? (
          <p className="text-red-400 text-xs text-center">
            {decodeURIComponent(resolvedSearchParams.error)}
          </p>
        ) : (
          <p className="text-zinc-700 text-xs text-center">
            Al continuar aceptás que guardemos tu colección de cartas.
          </p>
        )}
      </div>
    </main>
  );
}
