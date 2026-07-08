import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const clients = await prisma.client.findMany({
    include: { corretor: { select: { id: true, name: true } }, deal: true, notes: false },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  if (!body.nome || typeof body.nome !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const parsedNextContactAt = body.nextContactAt ? new Date(body.nextContactAt) : null;
  const parsedVisitDate = body.visitDate ? new Date(body.visitDate) : null;

  if (parsedNextContactAt && Number.isNaN(parsedNextContactAt.getTime())) {
    return NextResponse.json({ error: "Data de próximo contato inválida" }, { status: 400 });
  }
  if (parsedVisitDate && Number.isNaN(parsedVisitDate.getTime())) {
    return NextResponse.json({ error: "Data de visita inválida" }, { status: 400 });
  }


  const client = await prisma.client.create({
    data: {
      nome: body.nome,
      telefone: body.telefone || null,
      origem: body.origem || null,
      interesse: body.interesse || "COMPRA",
      tipoImovel: body.tipoImovel || null,
      bairro: body.bairro || null,
      valorImovel: body.valorImovel ? Number(body.valorImovel) : null,
      nextContactAt: parsedNextContactAt,
      visitDate: body.status === "VISITA_AGENDADA" ? parsedVisitDate : null,
      corretorId: body.corretorId || (session.user as any).id,
      status: body.status || "NOVO_LEAD",
    },
  });

  return NextResponse.json(client, { status: 201 });
}
