import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const deals = await prisma.deal.findMany({
    include: {
      client: { include: { corretor: { select: { id: true, name: true } } } },
    },
    orderBy: { dataFechamento: "desc" },
  });

  return NextResponse.json(deals);
}
