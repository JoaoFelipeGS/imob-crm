export const STATUS_PIPELINE = [
  { key: "NOVO_LEAD", label: "Novo Lead", color: "#5FF5E0" },
  { key: "CONTATO_FEITO", label: "Contato Feito", color: "#7C5CFF" },
  { key: "VISITA_AGENDADA", label: "Visita Agendada", color: "#A594FF" },
  { key: "PROPOSTA_ENVIADA", label: "Proposta Enviada", color: "#FBBF24" },
  { key: "NEGOCIACAO", label: "Negociação", color: "#FB923C" },
  { key: "FECHADO_GANHO", label: "Fechado - Ganho", color: "#34D399" },
  { key: "FECHADO_PERDIDO", label: "Fechado - Perdido", color: "#FB7185" },
] as const;

export type StatusKey = (typeof STATUS_PIPELINE)[number]["key"];

export const STATUS_MAP = Object.fromEntries(
  STATUS_PIPELINE.map((s) => [s.key, s])
) as Record<StatusKey, (typeof STATUS_PIPELINE)[number]>;

// Colunas mostradas no board (fechados/perdidos ficam fora, têm aba própria)
export const PIPELINE_BOARD_STATUSES: StatusKey[] = [
  "NOVO_LEAD",
  "CONTATO_FEITO",
  "VISITA_AGENDADA",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
];

export const STATUS_COMISSAO = [
  { key: "PENDENTE", label: "Pendente", color: "#FBBF24" },
  { key: "PARCIAL", label: "Recebida Parcial", color: "#7C5CFF" },
  { key: "RECEBIDA", label: "Recebida", color: "#34D399" },
] as const;

export const STATUS_COMISSAO_MAP = Object.fromEntries(
  STATUS_COMISSAO.map((s) => [s.key, s])
) as Record<string, (typeof STATUS_COMISSAO)[number]>;

export const INTERESSE_LABEL: Record<string, string> = {
  COMPRA: "Compra",
  VENDA: "Venda",
  ALUGUEL: "Aluguel",
};
