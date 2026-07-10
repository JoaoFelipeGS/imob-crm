"use client";

import { useEffect, useState } from "react";
import { formatData, formatDataHora } from "@/lib/format";

type ClientSummary = {
  id: string;
  nome: string;
  nextContactAt?: string | null;
  visitDate?: string | null;
  telefone?: string | null;
  status: string;
};

export default function DashboardPage() {
  const [clientes, setClientes] = useState<ClientSummary[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [deletandoIds, setDeletandoIds] = useState<string[]>([]);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
      setCarregando(false);
    }

    carregar();
  }, []);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const clientesHoje = clientes.filter((cliente) => {
    if (!cliente.nextContactAt) return false;
    const data = new Date(cliente.nextContactAt);
    return data >= hoje && data < amanha;
  });

  const visitas = clientes.filter((cliente) => cliente.status === "VISITA_AGENDADA" && cliente.visitDate);

  function getWhatsAppUrl(telefone?: string | null) {
    if (!telefone) return null;

    const digits = telefone.replace(/\D/g, "");
    if (!digits) return null;

    const normalized = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${normalized}`;
  }

  async function excluirCliente(clienteId: string, nome: string) {
    if (!confirm(`Excluir ${nome} definitivamente? Essa ação remove o lead e todos os dados associados.`)) {
      return;
    }

    setDeletandoIds((prev) => [...prev, clienteId]);
    const res = await fetch(`/api/clients/${clienteId}`, { method: "DELETE" });
    if (res.ok) {
      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteId));
    }
    setDeletandoIds((prev) => prev.filter((id) => id !== clienteId));
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="rounded-[2rem] border border-border bg-panel/80 p-6 shadow-panel backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-soft">Painel diário</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Acompanhe hoje</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Visualize seus contatos prioritários, visitas agendadas e o status geral do pipeline.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/80 bg-void p-4 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-ink-muted">Clientes totais</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-soft">{clientes.length}</p>
            </div>
            <div className="rounded-3xl border border-border/80 bg-void p-4 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-ink-muted">Retornos hoje</p>
              <p className="mt-2 text-3xl font-semibold text-violet-soft">{clientesHoje.length}</p>
            </div>
            <div className="rounded-3xl border border-border/80 bg-void p-4 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-ink-muted">Visitas agendadas</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{visitas.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-[2rem] border border-border bg-panel/80 p-6 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Quem ligar hoje</h2>
              <p className="mt-1 text-sm text-ink-muted">Retornos agendados para hoje em ordem de prioridade.</p>
            </div>
            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-soft">
              {clientesHoje.length} item(s)
            </span>
          </div>
          {carregando ? (
            <div className="rounded-3xl border border-border/80 bg-void p-6 text-center text-sm text-ink-muted">
              Carregando painel...
            </div>
          ) : clientesHoje.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-void p-6 text-center text-sm text-ink-muted">
              Nenhum follow-up marcado para hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {clientesHoje.map((cliente) => {
                const whatsappUrl = getWhatsAppUrl(cliente.telefone);

                return (
                  <div key={cliente.id} className="rounded-3xl border border-border/70 bg-panel2 p-4 transition hover:border-cyan/40 hover:bg-panel/90">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-ink">{cliente.nome}</p>
                        <p className="mt-1 text-sm text-ink-muted">{cliente.telefone || "Telefone não disponível"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded-full bg-slate-950/70 px-3 py-1 text-sm text-cyan-soft">
                          {formatDataHora(cliente.nextContactAt)}
                        </div>
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
                          >
                            WhatsApp
                          </a>
                        ) : null}
                        <button
                          type="button"
                          disabled={deletandoIds.includes(cliente.id)}
                          onClick={() => excluirCliente(cliente.id, cliente.nome)}
                          className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-60"
                        >
                          {deletandoIds.includes(cliente.id) ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-[2rem] border border-border bg-panel/80 p-6 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">Agenda de visitas</h2>
              <p className="mt-1 text-sm text-ink-muted">Clientes com visitas agendadas no seu pipeline.</p>
            </div>
            <span className="rounded-full border border-violet/20 bg-violet/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-soft">
              {visitas.length}
            </span>
          </div>
          {visitas.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-void p-6 text-center text-sm text-ink-muted">
              Nenhuma visita agendada no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {visitas.map((visita) => {
                const whatsappUrl = getWhatsAppUrl(visita.telefone);

                return (
                  <div key={visita.id} className="rounded-3xl border border-border/70 bg-panel2 p-4 transition hover:border-violet/40 hover:bg-panel/90">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{visita.nome}</p>
                        <p className="mt-1 text-sm text-ink-muted">{visita.telefone || "Telefone não disponível"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-violet-soft">{formatData(visita.visitDate)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
                          >
                            WhatsApp
                          </a>
                        ) : null}
                        <button
                          type="button"
                          disabled={deletandoIds.includes(visita.id)}
                          onClick={() => excluirCliente(visita.id, visita.nome)}
                          className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-60"
                        >
                          {deletandoIds.includes(visita.id) ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
