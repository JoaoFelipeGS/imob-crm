export function formatMoeda(valor?: number | null) {
  if (valor === undefined || valor === null) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatData(data?: string | Date | null) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}

export function formatDataHora(data?: string | Date | null) {
  if (!data) return "—";
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
