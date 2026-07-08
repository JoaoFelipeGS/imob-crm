"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  nome: "",
  telefone: "",
  origem: "",
  interesse: "COMPRA",
  status: "NOVO_LEAD",
  tipoImovel: "",
  bairro: "",
  valorImovel: "",
  nextContactAt: "",
  visitDate: "",
  corretorId: "",
};

export default function NovoClientePage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(initialForm);

  function set<K extends keyof typeof form>(campo: K, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function handleStatusChange(value: string) {
    set("status", value);
    if (value !== "VISITA_AGENDADA") {
      set("visitDate", "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setFeedback("");
    if (!form.nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }
    setSalvando(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSalvando(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setErro(payload?.error || "Não foi possível salvar o cliente.");
      return;
    }
    setFeedback("Cliente cadastrado com sucesso.");
    setForm(initialForm);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Novo cliente</h1>
      <p className="mt-1 text-sm text-ink-muted">Cadastre um lead para entrar no pipeline.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-border bg-panel/60 p-4 shadow-panel backdrop-blur-xl sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <Campo label="Nome completo" required span2>
            <input className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Marcos Ribeiro" />
          </Campo>

          <Campo label="Telefone / WhatsApp">
            <input className={inputCls} value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />
          </Campo>

          <Campo label="Origem do lead">
            <input className={inputCls} value={form.origem} onChange={(e) => set("origem", e.target.value)} placeholder="Instagram, indicação, site..." />
          </Campo>

          <Campo label="Interesse">
            <select className={inputCls} value={form.interesse} onChange={(e) => set("interesse", e.target.value)}>
              <option value="COMPRA">Compra</option>
              <option value="VENDA">Venda</option>
              <option value="ALUGUEL">Aluguel</option>
            </select>
          </Campo>

          <Campo label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => handleStatusChange(e.target.value)}>
              <option value="NOVO_LEAD">Novo Lead</option>
              <option value="CONTATO_FEITO">Contato Feito</option>
              <option value="VISITA_AGENDADA">Visita Agendada</option>
              <option value="PROPOSTA_ENVIADA">Proposta Enviada</option>
              <option value="NEGOCIACAO">Negociação</option>
            </select>
          </Campo>

          <Campo label="Tipo de imóvel">
            <input className={inputCls} value={form.tipoImovel} onChange={(e) => set("tipoImovel", e.target.value)} placeholder="Apto 2 dorm, casa..." />
          </Campo>

          <Campo label="Bairro / região">
            <input className={inputCls} value={form.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Centro, Jardim América..." />
          </Campo>

          <Campo label="Valor de interesse (R$)">
            <input type="number" step="0.01" className={inputCls} value={form.valorImovel} onChange={(e) => set("valorImovel", e.target.value)} placeholder="350000" />
          </Campo>

          <Campo label="Próximo contato em">
            <input type="datetime-local" className={inputCls} value={form.nextContactAt} onChange={(e) => set("nextContactAt", e.target.value)} />
          </Campo>
        </div>

        {erro && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{erro}</p>
        )}
        {feedback && (
          <p className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan-soft">{feedback}</p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-4 py-3 text-sm text-ink-muted transition hover:bg-panel2">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="rounded-xl bg-cyan px-5 py-3 text-sm font-semibold text-void transition hover:bg-cyan-soft disabled:opacity-60">
            {salvando ? "Salvando..." : "Salvar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-void px-3.5 py-3 text-sm text-ink outline-none transition focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30";

function Campo({
  label,
  required,
  span2,
  children,
}: {
  label: string;
  required?: boolean;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label} {required && <span className="text-cyan">*</span>}
      </label>
      {children}
    </div>
  );
}
