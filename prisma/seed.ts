import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  const usuario = await prisma.user.upsert({
    where: { email: "voce@imobiliaria.com" },
    update: {},
    create: {
      name: "Você",
      email: "voce@imobiliaria.com",
      password: senhaHash,
      role: "ADMIN",
    },
  });

  await prisma.client.createMany({
    data: [
      {
        nome: "Marcos Ribeiro",
        telefone: "(14) 99999-1010",
        email: "marcos@email.com",
        origem: "Instagram",
        interesse: "COMPRA",
        tipoImovel: "Apartamento 2 dorm",
        bairro: "Centro",
        valorImovel: 320000,
        status: "NOVO_LEAD",
        nextContactAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        corretorId: usuario.id,
      },
      {
        nome: "Fernanda Lima",
        telefone: "(14) 99999-2020",
        email: "fernanda@email.com",
        origem: "Indicação",
        interesse: "VENDA",
        tipoImovel: "Casa 3 dorm",
        bairro: "Jardim América",
        valorImovel: 480000,
        status: "VISITA_AGENDADA",
        nextContactAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
        corretorId: usuario.id,
      },
      {
        nome: "Roberto Chen",
        telefone: "(14) 99999-3030",
        email: "roberto@email.com",
        origem: "Site",
        interesse: "ALUGUEL",
        tipoImovel: "Apartamento 1 dorm",
        bairro: "Fragata",
        valorImovel: 1800,
        status: "NEGOCIACAO",
        nextContactAt: new Date(Date.now() + 1000 * 60 * 60 * 72),
        corretorId: usuario.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído. Login: voce@imobiliaria.com / senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
