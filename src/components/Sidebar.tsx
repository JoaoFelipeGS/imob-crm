"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { iniciais } from "@/lib/format";

const LINKS = [
  { href: "/dashboard", label: "Painel", icon: DashboardIcon },
  { href: "/pipeline", label: "Pipeline", icon: PipelineIcon },
  { href: "/fechados", label: "Fechados", icon: DealIcon },
];

export default function Sidebar({ user }: { user: { name?: string; email?: string; role?: string } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-panel/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 border-b border-border px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/30 bg-void shadow-glow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#00E5C7" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#7C5CFF" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-none text-ink">Órbita CRM</p>
          <p className="mt-1 text-[11px] leading-none text-ink-faint">Imobiliária</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <Link
          href="/clientes/novo"
          className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-cyan px-3 py-2.5 text-sm font-semibold text-void transition hover:bg-cyan-soft"
        >
          <PlusIcon /> Novo cliente
        </Link>

        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-cyan/25 bg-cyan/10 text-cyan-soft shadow-glow"
                  : "text-ink-muted hover:bg-panel2 hover:text-ink"
              }`}
            >
              <Icon active={!!active} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-xs font-semibold text-violet-soft">
            {iniciais(user?.name || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-[11px] text-ink-faint">{user?.role === "ADMIN" ? "Administrador" : "Corretor(a)"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sair"
            className="rounded-md p-1.5 text-ink-faint transition hover:bg-panel2 hover:text-danger"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="6" rx="2" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
      <rect x="3" y="14" width="8" height="6" rx="2" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
      <rect x="15" y="14" width="6" height="6" rx="2" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
    </svg>
  );
}

function PipelineIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="4" height="16" rx="1" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
      <rect x="10" y="4" width="4" height="10" rx="1" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
      <rect x="17" y="4" width="4" height="7" rx="1" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.6" />
    </svg>
  );
}
function DealIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 7L9 18l-5-5" stroke={active ? "#5FF5E0" : "#8A93B3"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#080B14" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
