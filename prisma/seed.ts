import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      name: "Admin Imobiliária",
      email: "admin@imobiliaria.com",
      password: senhaHash,
      role: "ADMIN",
    },
  });

  console.log("Seed concluído. Login: admin@imobiliaria.com / senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
