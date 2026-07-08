import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const data: any = {};

  if (body.imovel !== undefined) data.imovel = body.imovel || null;
  if (body.valorVenda !== undefined) data.valorVenda = body.valorVenda === "" ? null : Number(body.valorVenda);
  if (body.valorComissao !== undefined) data.valorComissao = body.valorComissao === "" ? null : Number(body.valorComissao);
  if (body.statusComissao !== undefined) data.statusComissao = body.statusComissao;
  if (body.dataPrevistaRecebimento !== undefined)
    data.dataPrevistaRecebimento = body.dataPrevistaRecebimento ? new Date(body.dataPrevistaRecebimento) : null;
  if (body.dataRecebimento !== undefined)
    data.dataRecebimento = body.dataRecebimento ? new Date(body.dataRecebimento) : null;

  const deal = await prisma.deal.update({ where: { id: params.id }, data });
  return NextResponse.json(deal);
}
