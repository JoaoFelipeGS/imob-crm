"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_COMISSAO, STATUS_COMISSAO_MAP } from "@/lib/constants";
import { formatMoeda, formatData, iniciais } from "@/lib/format";

type Deal = {
  id: string;
  imovel?: string | null;
  valorVenda?: number | null;
  valorComissao?: number | null;
  valorRecebido?: number | null;
  statusComissao: string;
  dataFechamento: string;
  dataPrevistaRecebimento?: string | null;
  dataRecebimento?: string | null;
  client: {
    id: string;
    nome: string;
    bairro?: string | null;
    corretor?: { name: string } | null;
  };
};

export default function FechadosList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => {
        setDeals(d);
        setCarregando(false);
      });
  }, []);

  const totalComissaoPendente = deals
    .filter((d) => d.statusComissao !== "RECEBIDA")
    .reduce((acc, d) => acc + (d.valorComissao || 0), 0);
  const totalComissaoRecebida = deals
    .map((d) => {
      if (d.valorRecebido !== undefined && d.valorRecebido !== null) return d.valorRecebido || 0;
      if (d.statusComissao === "RECEBIDA") return d.valorComissao || 0;
      return 0;
    })
    .reduce((acc, v) => acc + v, 0);
  const totalFaltandoReceber = deals
    .map((d) => {
      const recebido = d.valorRecebido || 0;
      const comissao = d.valorComissao || 0;
      return Math.max(0, comissao - recebido);
    })
    .reduce((acc, v) => acc + v, 0);
  const totalVendas = deals.reduce((acc, d) => acc + (d.valorVenda || 0), 0);

  async function salvar(id: string, patch: Partial<Deal>) {
    setSalvando(true);
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSalvando(false);
    if (res.ok) {
      const atualizado = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...atualizado } : d)));
    }
  }

  if (carregando) {
    return <div className="flex h-64 items-center justify-center text-sm text-ink-faint">Carregando negócios fechados...</div>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Fechados</h1>
      <p className="mt-1 text-sm text-ink-muted">Negócios concluídos e o acompanhamento das comissões.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Total vendido" valor={formatMoeda(totalVendas)} cor="#5FF5E0" />
        <Kpi label="Comissão a receber" valor={formatMoeda(totalComissaoPendente)} cor="#FBBF24" />
        <Kpi label="Faltando receber" valor={formatMoeda(totalFaltandoReceber)} cor="#F59E0B" />
        <Kpi label="Comissão recebida" valor={formatMoeda(totalComissaoRecebida)} cor="#34D399" />
      </div>

      <div className="mt-6 space-y-3">
        {deals.length === 0 && (
          <p className="rounded-xl border border-border bg-panel/50 p-6 text-center text-sm text-ink-faint">
            Nenhum negócio fechado ainda. Mova um cliente para "Fechado - Ganho" no pipeline.
          </p>
        )}

        {deals.map((d) => {
          const st = STATUS_COMISSAO_MAP[d.statusComissao];
          const editando = editandoId === d.id;

          return (
            <div key={d.id} className="rounded-xl border border-border bg-panel/60 p-4 shadow-panel backdrop-blur-xl sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-xs font-semibold text-violet-soft">
                    {iniciais(d.client.nome)}
                  </div>
                  <div>
                    <Link href={`/clientes/${d.client.id}`} className="text-sm font-medium text-ink hover:text-cyan-soft">
                      {d.client.nome}
                    </Link>
                    <p className="text-xs text-ink-faint">
                      {[d.imovel, d.client.bairro].filter(Boolean).join(" · ") || "—"} · Fechado em {formatData(d.dataFechamento)}
                    </p>
                  </div>
                </div>
                <span
                  className="rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{ borderColor: `${st.color}55`, color: st.color, backgroundColor: `${st.color}15` }}
                >
                  {st.label}
                </span>
              </div>

                  {!editando ? (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <Info label="Valor da venda" valor={formatMoeda(d.valorVenda)} mono />
                  <Info label="Comissão" valor={formatMoeda(d.valorComissao)} mono destaque />
                  <Info label="Recebido" valor={formatMoeda(d.valorRecebido || 0)} mono />
                  <Info label="Faltando" valor={formatMoeda(Math.max(0, (d.valorComissao || 0) - (d.valorRecebido || 0)))} />
                </div>
              ) : (
                <EditForm deal={d} salvando={salvando} onSalvar={(patch) => { salvar(d.id, patch); setEditandoId(null); }} onCancelar={() => setEditandoId(null)} />
              )}

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <p className="text-xs text-ink-faint">Corretor: {d.client.corretor?.name || "—"}</p>
                {!editando && (
                  <button onClick={() => setEditandoId(d.id)} className="text-xs font-medium text-cyan-soft hover:text-cyan">
                    Editar comissão
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel/60 p-4 shadow-panel backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1.5 font-mono text-xl font-semibold" style={{ color: cor }}>{valor}</p>
    </div>
  );
}

function Info({ label, valor, mono, destaque }: { label: string; valor: string; mono?: boolean; destaque?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`mt-0.5 ${mono ? "font-mono" : ""} ${destaque ? "text-cyan-soft font-semibold" : "text-ink"}`}>{valor}</p>
    </div>
  );
}

function EditForm({
  deal,
  salvando,
  onSalvar,
  onCancelar,
}: {
  deal: Deal;
  salvando: boolean;
  onSalvar: (patch: Partial<Deal>) => void;
  onCancelar: () => void;
}) {
  const [imovel, setImovel] = useState(deal.imovel || "");
  const [valorVenda, setValorVenda] = useState(deal.valorVenda?.toString() || "");
  const [valorComissao, setValorComissao] = useState(deal.valorComissao?.toString() || "");
  const [valorRecebido, setValorRecebido] = useState(deal.valorRecebido?.toString() || "");
  const [statusComissao, setStatusComissao] = useState(deal.statusComissao);
  const [dataPrevista, setDataPrevista] = useState(deal.dataPrevistaRecebimento?.slice(0, 10) || "");
  const [dataRecebida, setDataRecebida] = useState(deal.dataRecebimento?.slice(0, 10) || "");

  const inputCls =
    "w-full rounded-lg border border-border bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30";

  return (
    <div className="mt-4 grid grid-cols-1 gap-3.5 rounded-lg border border-border/70 bg-panel2/60 p-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Imóvel</label>
        <input className={inputCls} value={imovel} onChange={(e) => setImovel(e.target.value)} placeholder="Apto 2 dorm - Centro" />
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Valor da venda (R$)</label>
        <input type="number" step="0.01" className={inputCls} value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Valor da comissão (R$)</label>
        <input type="number" step="0.01" className={inputCls} value={valorComissao} onChange={(e) => setValorComissao(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Valor recebido (R$)</label>
        <input type="number" step="0.01" className={inputCls} value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Status da comissão</label>
        <select className={inputCls} value={statusComissao} onChange={(e) => setStatusComissao(e.target.value)}>
          {STATUS_COMISSAO.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Previsão de recebimento</label>
        <input type="date" className={inputCls} value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-[11px] uppercase tracking-wider text-ink-faint">Data em que recebeu</label>
        <input type="date" className={inputCls} value={dataRecebida} onChange={(e) => setDataRecebida(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2.5 sm:col-span-2">
        <button onClick={onCancelar} className="rounded-lg border border-border px-3.5 py-2 text-xs text-ink-muted hover:bg-panel2">
          Cancelar
        </button>
        <button
          disabled={salvando}
          onClick={() =>
            onSalvar({
              imovel,
              valorVenda: valorVenda as any,
              valorComissao: valorComissao as any,
              valorRecebido: valorRecebido as any,
              statusComissao,
              dataPrevistaRecebimento: dataPrevista as any,
              dataRecebimento: dataRecebida as any,
            })
          }
          className="rounded-lg bg-cyan px-4 py-2 text-xs font-semibold text-void hover:bg-cyan-soft disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
