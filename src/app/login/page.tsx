"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const res = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
      callbackUrl: `${window.location.origin}/pipeline`,
    });
    setCarregando(false);
    if (res?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    if (res?.url) {
      router.push(res.url);
    } else {
      router.push("/pipeline");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/30 bg-panel shadow-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#00E5C7" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#7C5CFF" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="4.2" ry="10" stroke="#7C5CFF" strokeWidth="1.2" opacity="0.5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Órbita CRM</h1>
          <p className="mt-1 text-sm text-ink-muted">Pipeline de vendas para sua imobiliária</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-panel/80 p-6 shadow-panel backdrop-blur-xl"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@imobiliaria.com"
              className="w-full rounded-lg border border-border bg-void px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">
              Senha
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-void px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
            />
          </div>

          {erro && (
            <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-cyan px-4 py-2.5 text-sm font-semibold text-void transition hover:bg-cyan-soft disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

      </div>
    </main>
  );
}
