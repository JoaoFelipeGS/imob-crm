import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientDetail from "@/components/ClientDetail";

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const cliente = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      corretor: { select: { name: true } },
      deal: { select: { id: true } },
      notes: {
        include: { autor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  return <ClientDetail cliente={JSON.parse(JSON.stringify(cliente))} />;
}
