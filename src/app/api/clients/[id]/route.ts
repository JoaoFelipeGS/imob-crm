import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      corretor: { select: { id: true, name: true } },
      deal: true,
      notes: { include: { autor: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  const data: any = {};
  for (const field of ["nome", "telefone", "origem", "interesse", "tipoImovel", "bairro", "corretorId"]) {
    if (body[field] !== undefined) data[field] = body[field] || null;
  }
  if (body.valorImovel !== undefined) {
    data.valorImovel = body.valorImovel === null || body.valorImovel === "" ? null : Number(body.valorImovel);
  }
  if (body.nextContactAt !== undefined) {
    const parsedNextContactAt = body.nextContactAt ? new Date(body.nextContactAt) : null;
    if (body.nextContactAt && parsedNextContactAt && Number.isNaN(parsedNextContactAt.getTime())) {
      return NextResponse.json({ error: "Data de próximo contato inválida" }, { status: 400 });
    }
    data.nextContactAt = parsedNextContactAt;
  }
  if (body.visitDate !== undefined) {
    const parsedVisitDate = body.visitDate ? new Date(body.visitDate) : null;
    if (body.visitDate && parsedVisitDate && Number.isNaN(parsedVisitDate.getTime())) {
      return NextResponse.json({ error: "Data de visita inválida" }, { status: 400 });
    }
    data.visitDate = parsedVisitDate;
  }

  const client = await prisma.client.update({ where: { id: params.id }, data });
  return NextResponse.json(client);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
