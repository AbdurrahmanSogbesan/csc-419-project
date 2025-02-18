// todo: add seeder - use fakerjs to generate fake data

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //   const user = await prisma.user.create({
  //     data: {
  //       name: 'John Doe',
  //       email: 'john.doe@example.com',
  //       password: 'password',
  //     },
  //   });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
