"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/fechados", label: "Fechados" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-panel/90 backdrop-blur-xl lg:hidden">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              active ? "text-cyan-soft" : "text-ink-muted"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
