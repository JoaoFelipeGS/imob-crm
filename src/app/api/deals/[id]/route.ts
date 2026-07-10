import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  // fetch current deal to make decisions about partial/full payments
  const existente = await prisma.deal.findUnique({ where: { id: params.id } });

  if (body.imovel !== undefined) data.imovel = body.imovel || null;
  if (body.valorVenda !== undefined) data.valorVenda = body.valorVenda === "" ? null : Number(body.valorVenda);
  const novoValorComissao = body.valorComissao !== undefined ? (body.valorComissao === "" ? null : Number(body.valorComissao)) : existente?.valorComissao ?? null;
  if (body.valorComissao !== undefined) data.valorComissao = novoValorComissao;

  const novoValorRecebido = body.valorRecebido !== undefined ? (body.valorRecebido === "" ? null : Number(body.valorRecebido)) : existente?.valorRecebido ?? null;
  if (body.valorRecebido !== undefined) data.valorRecebido = novoValorRecebido;

  let novoStatus = body.statusComissao !== undefined ? body.statusComissao : existente?.statusComissao;

  // If valorRecebido indicates full payment, mark as RECEBIDA
  if (novoValorComissao !== null && novoValorRecebido !== null && novoValorRecebido >= novoValorComissao) {
    novoStatus = "RECEBIDA";
    data.dataRecebimento = body.dataRecebimento ? new Date(body.dataRecebimento) : new Date();
    data.valorRecebido = novoValorComissao; // cap to total
  }

  // If user explicitly marked RECEBIDA but didn't provide valorRecebido, set valorRecebido to total
  if (novoStatus === "RECEBIDA" && (novoValorRecebido === null || novoValorRecebido === undefined) && novoValorComissao !== null) {
    data.valorRecebido = novoValorComissao;
    data.dataRecebimento = body.dataRecebimento ? new Date(body.dataRecebimento) : new Date();
  }

  if (body.statusComissao !== undefined) data.statusComissao = novoStatus;
  if (body.dataPrevistaRecebimento !== undefined)
    data.dataPrevistaRecebimento = body.dataPrevistaRecebimento ? new Date(body.dataPrevistaRecebimento) : null;
  if (body.dataRecebimento !== undefined)
    data.dataRecebimento = body.dataRecebimento ? new Date(body.dataRecebimento) : data.dataRecebimento;

  const deal = await prisma.deal.update({ where: { id: params.id }, data });
  return NextResponse.json(deal);
}
