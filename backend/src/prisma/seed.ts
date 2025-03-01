import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function generateValidISBN13(): string {
  const prefix = '978';
  const randomDigits = faker.string.numeric(9); // Generate 9 random digits
  const partialISBN = prefix + randomDigits;

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < partialISBN.length; i++) {
    sum += Number(partialISBN[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;

  return partialISBN + checksum;
}

async function seedBooks() {
  console.log('Seeding books...');

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Biography',
    'History',
    'Self-Help',
    'Education',
    'Philosophy',
    'Business',
    'Psychology',
    'Technology',
  ];

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
      title: faker.lorem.words(3),
      author: faker.person.fullName(),
      category: faker.helpers.arrayElement(categories),
      ISBN: generateValidISBN13(), // Generate a valid ISBN
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
