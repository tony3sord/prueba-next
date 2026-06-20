"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@heroui/react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed", error);
      setError("No se pudo cerrar sesión. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="secondary" onClick={handleLogout} isDisabled={loading}>
        {loading ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
