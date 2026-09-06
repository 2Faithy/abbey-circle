import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "sarah.loanofficer@abbeycircle.com" },
      update: {},
      create: {
        email: "sarah.loanofficer@abbeycircle.com",
        passwordHash: password,
        name: "Sarah Johnson",
        role: "LOAN_OFFICER",
        company: "Abbey Mortgage Bank",
        bio: "12 years helping first-time buyers navigate financing.",
        phone: "555-0101",
      },
    }),
    prisma.user.upsert({
      where: { email: "mike.realtor@abbeycircle.com" },
      update: {},
      create: {
        email: "mike.realtor@abbeycircle.com",
        passwordHash: password,
        name: "Mike Chen",
        role: "REALTOR",
        company: "Chen Realty Group",
        bio: "Residential specialist across the metro area.",
        phone: "555-0102",
      },
    }),
    prisma.user.upsert({
      where: { email: "amaka.client@abbeycircle.com" },
      update: {},
      create: {
        email: "amaka.client@abbeycircle.com",
        passwordHash: password,
        name: "Amaka Obi",
        role: "CLIENT",
        bio: "Looking to buy my first home this year.",
        phone: "555-0103",
      },
    }),
    prisma.user.upsert({
      where: { email: "david.loanofficer@abbeycircle.com" },
      update: {},
      create: {
        email: "david.loanofficer@abbeycircle.com",
        passwordHash: password,
        name: "David Okafor",
        role: "LOAN_OFFICER",
        company: "Abbey Mortgage Bank",
        bio: "Focused on jumbo loans and refinancing.",
        phone: "555-0104",
      },
    }),
  ]);

  const [sarah, mike, amaka, david] = users;

  // A mix of connection states so the demo shows every case
  await prisma.connection.upsert({
    where: { requesterId_addresseeId: { requesterId: sarah.id, addresseeId: mike.id } },
    update: {},
    create: { requesterId: sarah.id, addresseeId: mike.id, status: "ACCEPTED" },
  });

  await prisma.connection.upsert({
    where: { requesterId_addresseeId: { requesterId: amaka.id, addresseeId: sarah.id } },
    update: {},
    create: { requesterId: amaka.id, addresseeId: sarah.id, status: "PENDING" },
  });

  await prisma.connection.upsert({
    where: { requesterId_addresseeId: { requesterId: david.id, addresseeId: mike.id } },
    update: {},
    create: { requesterId: david.id, addresseeId: mike.id, status: "DECLINED" },
  });

  console.log("Seed complete. Demo login password for all users: password123");
  console.log(users.map((u) => u.email));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });