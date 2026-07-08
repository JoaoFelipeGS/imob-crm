import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body.texto || typeof body.texto !== "string" || !body.texto.trim()) {
    return NextResponse.json({ error: "Texto da anotação é obrigatório" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      texto: body.texto.trim(),
      clientId: params.id,
      autorId: (session.user as any).id,
    },
    include: { autor: { select: { name: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
