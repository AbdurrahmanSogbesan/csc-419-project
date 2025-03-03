import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedBooks() {
  console.log('Seeding books...');

  const books = new Map<
    string,
    {
      title: string;
      author: string;
      category: string;
      ISBN: string;
      publishedYear: number;
      copiesAvailable: number;
    }
  >();

  while (books.size < 30) {
    const book = {
      title: faker.book.title(),
      author: faker.book.author(),
      category: faker.book.genre(),
      ISBN: faker.commerce.isbn(),
      publishedYear: faker.number.int({ min: 1900, max: 2024 }),
      copiesAvailable: faker.number.int({ min: 1, max: 10 }),
    };

    books.set(book.ISBN, book); // Ensures unique ISBNs
  }

  const bookArray = Array.from(books.values());

  try {
    await prisma.book.createMany({ data: bookArray });
    console.log(`${bookArray.length} books seeded successfully!`);
  } catch (error) {
    console.error('Error seeding books:', error);
  }
}

async function main() {
  await seedBooks();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
