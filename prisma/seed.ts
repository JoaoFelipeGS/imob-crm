import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash("991833563aB!!", 10);

  await prisma.user.create({
    data: {
      name: "Felipe Gomes",
      email: "felipegomesdasilvaj@gmail.com",
      password: senhaHash,
      role: "ADMIN",
    },
  });

  console.log("Seed concluído. Login: felipegomesdasilvaj@gmail.com / senha: 991833563aB!!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
