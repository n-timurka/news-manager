import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin",
      posts: {
        create: [
          {
            title: "Very important Admin Post",
            content: "Content",
            published: true,
          },
        ],
      },
    },
  });

  const user = prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "User",
      posts: {
        create: [
          {
            title: "Regular User Post",
            content: "Content",
            published: true,
          },
          {
            title: "Another Regular User Post",
            content: "Content",
            published: false,
          },
        ],
      },
    },
  });

  console.log({ admin, user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
