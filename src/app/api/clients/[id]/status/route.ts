import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_VALIDOS = [
  "NOVO_LEAD",
  "CONTATO_FEITO",
  "VISITA_AGENDADA",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "FECHADO_GANHO",
  "FECHADO_PERDIDO",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { status } = body;

  if (!STATUS_VALIDOS.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id: params.id },
    data: { status },
  });

  // Se moveu para "Fechado - Ganho", garante que exista um registro de negócio/comissão
  if (status === "FECHADO_GANHO") {
    const existente = await prisma.deal.findUnique({ where: { clientId: params.id } });
    if (!existente) {
      await prisma.deal.create({
        data: {
          clientId: params.id,
          imovel: client.tipoImovel,
          valorVenda: client.valorImovel,
        },
      });
    }
  }

  return NextResponse.json(client);
}
