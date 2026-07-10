"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PIPELINE_BOARD_STATUSES, STATUS_MAP, INTERESSE_LABEL, StatusKey } from "@/lib/constants";
import { formatMoeda, iniciais } from "@/lib/format";

type Client = {
  id: string;
  nome: string;
  telefone?: string | null;
  origem?: string | null;
  interesse: string;
  tipoImovel?: string | null;
  bairro?: string | null;
  valorImovel?: number | null;
  status: StatusKey;
  corretor?: { name: string } | null;
};

const COLUNAS: { key: StatusKey; final?: boolean }[] = [
  ...PIPELINE_BOARD_STATUSES.map((k) => ({ key: k })),
  { key: "FECHADO_GANHO", final: true },
];

export default function PipelineBoard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<StatusKey | null>(null);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function moverPara(clientId: string, status: StatusKey) {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, status } : c)));
    await fetch(`/api/clients/${clientId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (status === "FECHADO_GANHO") carregar();
  }

  async function marcarPerdido(clientId: string) {
    if (!confirm("Marcar este cliente como perdido? Ele sai do pipeline.")) return;
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    await fetch(`/api/clients/${clientId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FECHADO_PERDIDO" }),
    });
  }

  const clientesFiltrados = clients.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-faint">
        Carregando pipeline...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Pipeline</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Arraste os cards entre as colunas conforme o cliente avança.
          </p>
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full rounded-xl border border-border bg-panel px-3.5 py-3 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30 sm:w-64"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-x-auto pb-4 lg:flex-row">
        {COLUNAS.map(({ key, final }) => {
          const status = STATUS_MAP[key];
          const itens = clientesFiltrados.filter((c) => c.status === key);
          const valorTotal = itens.reduce((acc, c) => acc + (c.valorImovel || 0), 0);

          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                setColunaAlvo(key);
              }}
              onDragLeave={() => setColunaAlvo((prev) => (prev === key ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (arrastando) moverPara(arrastando, key);
                setArrastando(null);
                setColunaAlvo(null);
              }}
              className={`flex min-h-[18rem] w-full shrink-0 flex-col rounded-2xl border transition lg:w-72 ${
                colunaAlvo === key
                  ? "border-cyan/50 bg-cyan/5"
                  : "border-border bg-panel/40"
              } ${final ? "border-success/20" : ""}`}
            >
              <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}` }}
                  />
                  <span className="text-sm font-medium text-ink">{status.label}</span>
                </div>
                <span className="rounded-full bg-panel2 px-2 py-0.5 text-xs text-ink-faint">
                  {itens.length}
                </span>
              </div>
              {valorTotal > 0 && (
                <div className="border-b border-border/50 px-3.5 py-1.5 font-mono text-[11px] text-ink-faint">
                  {formatMoeda(valorTotal)}
                </div>
              )}

              <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
                {itens.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-ink-faint">Nenhum cliente aqui.</p>
                )}
                {itens.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setArrastando(c.id)}
                    onDragEnd={() => setArrastando(null)}
                    className={`group relative rounded-xl border border-border bg-panel2 p-3.5 shadow-panel transition hover:border-cyan/30 ${
                      arrastando === c.id ? "opacity-40" : ""
                    }`}
                  >
                    <Link href={`/clientes/${c.id}`} className="block">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{c.nome}</p>
                        {c.corretor && (
                          <span
                            title={c.corretor.name}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-[9px] font-semibold text-violet-soft"
                          >
                            {iniciais(c.corretor.name)}
                          </span>
                        )}
                      </div>
                      {(c.tipoImovel || c.bairro) && (
                        <p className="mb-1.5 text-xs text-ink-muted">
                          {[c.tipoImovel, c.bairro].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="rounded border border-border px-2 py-1 text-[10px] text-ink-faint">
                          {INTERESSE_LABEL[c.interesse]}
                        </span>
                        {c.valorImovel ? (
                          <span className="font-mono text-xs text-cyan-soft">{formatMoeda(c.valorImovel)}</span>
                        ) : null}
                      </div>
                    </Link>
                    {!final && (
                      <button
                        onClick={() => marcarPerdido(c.id)}
                        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-danger/40 bg-void text-danger group-hover:flex"
                        title="Marcar como perdido"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
