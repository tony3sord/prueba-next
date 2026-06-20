import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}/pack`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        exchangeError.message ?? "oauth_failed",
      )}`,
    );
  }

  return NextResponse.redirect(`${origin}/login`);
}
