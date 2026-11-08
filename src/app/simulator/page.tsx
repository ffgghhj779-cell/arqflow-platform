import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SimulatorClient from "./SimulatorClient";
import Link from "next/link";
import { MessageCircle, LogOut } from "lucide-react";

export default async function SimulatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#162936] flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a2f3c]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white">
              <MessageCircle className="w-5 h-5" />
            </span>
            <span className="gradient-text">ArqFlow</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost !px-3 text-sm text-slate-500 hover:text-danger flex items-center gap-2">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </form>
        </div>
      </header>

      {/* Simulator Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)]">
        <SimulatorClient business={business} />
      </main>
    </div>
  );
}
