"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STATUS_PIPELINE, INTERESSE_LABEL, STATUS_MAP, StatusKey } from "@/lib/constants";
import { formatMoeda, formatDataHora, iniciais } from "@/lib/format";

type Nota = { id: string; texto: string; createdAt: string; autor?: { name: string } | null };
type Cliente = {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  origem?: string | null;
  interesse: string;
  tipoImovel?: string | null;
  bairro?: string | null;
  valorImovel?: number | null;
  nextContactAt?: string | null;
  visitDate?: string | null;
  status: StatusKey;
  corretor?: { name: string } | null;
  createdAt: string;
  notes: Nota[];
  deal?: { id: string } | null;
};

export default function ClientDetail({ cliente: inicial }: { cliente: Cliente }) {
  const router = useRouter();
  const [cliente, setCliente] = useState(inicial);
  const [nota, setNota] = useState("");
  const [enviandoNota, setEnviandoNota] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState(false);
  const [salvandoFollowUp, setSalvandoFollowUp] = useState(false);
  const [nextContactAtInput, setNextContactAtInput] = useState(
    cliente.nextContactAt ? formatarDataLocal(cliente.nextContactAt) : ""
  );
  const [visitDateInput, setVisitDateInput] = useState(
    cliente.visitDate ? formatarDataLocal(cliente.visitDate) : ""
  );

  async function enviarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!nota.trim()) return;
    setEnviandoNota(true);
    const res = await fetch(`/api/clients/${cliente.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: nota }),
    });
    setEnviandoNota(false);
    if (res.ok) {
      const nova = await res.json();
      setCliente((c) => ({ ...c, notes: [nova, ...c.notes] }));
      setNota("");
    }
  }

  async function mudarStatus(status: StatusKey) {
    setMudandoStatus(true);
    await fetch(`/api/clients/${cliente.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setCliente((c) => ({ ...c, status }));
    setMudandoStatus(false);
    if (status === "FECHADO_GANHO") router.refresh();
  }

  async function excluirCliente() {
    if (!confirm(`Excluir ${cliente.nome} definitivamente? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/clients/${cliente.id}`, { method: "DELETE" });
    router.push("/pipeline");
  }

  async function limparVisita() {
    if (!confirm("Remover a visita agendada deste cliente?")) return;
    setSalvandoFollowUp(true);
    const res = await fetch(`/api/clients/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitDate: null }),
    });
    setSalvandoFollowUp(false);
    if (res.ok) {
      setVisitDateInput("");
      setCliente((c) => ({ ...c, visitDate: null }));
    }
  }

  async function ligarHoje() {
    const agora = new Date();
    const formatted = formatarDataLocal(agora);
    setNextContactAtInput(formatted);
    setSalvandoFollowUp(true);
    const res = await fetch(`/api/clients/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextContactAt: formatted }),
    });
    setSalvandoFollowUp(false);
    if (res.ok) {
      const atualizado = await res.json();
      setCliente((c) => ({ ...c, nextContactAt: atualizado.nextContactAt }));
    }
  }

  async function salvarFollowUp(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoFollowUp(true);
    const res = await fetch(`/api/clients/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextContactAt: nextContactAtInput || null,
        visitDate: visitDateInput || null,
      }),
    });
    setSalvandoFollowUp(false);
    if (res.ok) {
      const atualizado = await res.json();
      setCliente((c) => ({
        ...c,
        nextContactAt: atualizado.nextContactAt,
        visitDate: atualizado.visitDate,
      }));
    }
  }

  const statusAtual = STATUS_MAP[cliente.status];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/pipeline" className="text-sm text-ink-muted transition hover:text-cyan-soft">
          ← Voltar ao pipeline
        </Link>
        <button onClick={excluirCliente} className="self-start rounded-lg border border-danger/20 px-3 py-2 text-xs text-ink-faint transition hover:text-danger sm:self-auto">
          Excluir cliente
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-panel/60 p-6 shadow-panel backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-sm font-semibold text-violet-soft">
                  {iniciais(cliente.nome)}
                </div>
                <div>
                  <h1 className="font-display text-xl font-semibold text-ink">{cliente.nome}</h1>
                  <p className="text-xs text-ink-faint">
                    Cliente desde {formatDataHora(cliente.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{ borderColor: `${statusAtual.color}55`, color: statusAtual.color, backgroundColor: `${statusAtual.color}15` }}
              >
                {statusAtual.label}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Telefone" valor={cliente.telefone} />
              <Info label="E-mail" valor={cliente.email} />
              <Info label="Origem" valor={cliente.origem} />
              <Info label="Interesse" valor={INTERESSE_LABEL[cliente.interesse]} />
              <Info label="Tipo de imóvel" valor={cliente.tipoImovel} />
              <Info label="Bairro" valor={cliente.bairro} />
              <Info label="Valor" valor={formatMoeda(cliente.valorImovel)} />
              <Info label="Próximo contato em" valor={cliente.nextContactAt ? formatDataHora(cliente.nextContactAt) : "—"} />
              <Info label="Data da visita" valor={cliente.visitDate ? formatDataHora(cliente.visitDate) : "—"} />
              <Info label="Corretor" valor={cliente.corretor?.name} />
            </div>

            <form onSubmit={salvarFollowUp} className="mt-5 grid gap-3 rounded-xl border border-border/70 bg-panel2/80 p-3 sm:grid-cols-2">
              <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Próximo contato
                <input
                  type="datetime-local"
                  value={nextContactAtInput}
                  onChange={(e) => setNextContactAtInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-void px-3 py-3 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
                />
              </label>
              <label className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Data da visita
                <input
                  type="datetime-local"
                  value={visitDateInput}
                  onChange={(e) => setVisitDateInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-void px-3 py-3 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
                />
              </label>
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={ligarHoje}
                    className="flex-1 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-xs font-semibold text-cyan-soft transition hover:bg-cyan/20 disabled:opacity-60"
                  >
                    Ligar hoje
                  </button>
                  <button
                    type="button"
                    onClick={limparVisita}
                    disabled={!cliente.visitDate && !visitDateInput}
                    className="flex-1 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-60"
                  >
                    Excluir visita
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={salvandoFollowUp}
                  className="rounded-xl bg-cyan px-4 py-3 text-xs font-semibold text-void transition hover:bg-cyan-soft disabled:opacity-60"
                >
                  {salvandoFollowUp ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>

          {/* Notas */}
          <div className="rounded-2xl border border-border bg-panel/60 p-6 shadow-panel backdrop-blur-xl">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Anotações
            </h2>

            <form onSubmit={enviarNota} className="mb-5 flex flex-col gap-2.5">
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Registre uma ligação, visita, feedback do cliente..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-void px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30"
              />
              <button
                type="submit"
                disabled={enviandoNota || !nota.trim()}
                className="self-end rounded-xl bg-cyan px-4 py-3 text-xs font-semibold text-void transition hover:bg-cyan-soft disabled:opacity-50"
              >
                {enviandoNota ? "Salvando..." : "Adicionar anotação"}
              </button>
            </form>

            <div className="space-y-3">
              {cliente.notes.length === 0 && (
                <p className="text-sm text-ink-faint">Nenhuma anotação ainda.</p>
              )}
              {cliente.notes.map((n) => (
                <div key={n.id} className="rounded-lg border border-border/70 bg-panel2 p-3.5">
                  <p className="text-sm text-ink">{n.texto}</p>
                  <p className="mt-2 text-[11px] text-ink-faint">
                    {n.autor?.name || "Equipe"} · {formatDataHora(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna lateral: status */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-panel/60 p-5 shadow-panel backdrop-blur-xl">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Mover no pipeline
            </h2>
            <div className="space-y-1.5">
              {STATUS_PIPELINE.map((s) => (
                <button
                  key={s.key}
                  disabled={mudandoStatus}
                  onClick={() => mudarStatus(s.key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                    cliente.status === s.key
                      ? "border border-cyan/30 bg-cyan/10 text-cyan-soft"
                      : "text-ink-muted hover:bg-panel2 hover:text-ink"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {cliente.status === "FECHADO_GANHO" && (
            <Link
              href="/fechados"
              className="block rounded-2xl border border-success/25 bg-success/10 p-5 text-sm text-success shadow-glow transition hover:bg-success/15"
            >
              Negócio fechado — ver dados de comissão →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-0.5 text-ink">{valor || "—"}</p>
    </div>
  );
}

function formatarDataLocal(data: string | Date) {
  const date = new Date(data);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
