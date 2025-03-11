import { Prisma } from '@prisma/client';

export function buildBookFilters(params: {
  search?: string;
  title?: string;
  author?: string;
  category?: string | string[]; // Modified to accept string or string[]
  ISBN?: string;
  publishedYear?: number | string;
  publishedYearStart?: number | string;
  publishedYearEnd?: number | string;
  availabilityStatus?: string;
  popularBooks?: boolean;
}): {
  where: Prisma.BookWhereInput;
  orderBy?: Prisma.BookOrderByWithRelationInput;
} {
  const {
    search,
    title,
    author,
    category,
    ISBN,
    publishedYear,
    publishedYearStart,
    publishedYearEnd,
    availabilityStatus,
    popularBooks,
  } = params;

  // Convert string numbers to actual numbers if needed
  const pubYear = publishedYear ? Number(publishedYear) : undefined;
  const pubYearStart = publishedYearStart
    ? Number(publishedYearStart)
    : undefined;
  const pubYearEnd = publishedYearEnd ? Number(publishedYearEnd) : undefined;

  // Build filters
  const filters: Prisma.BookWhereInput[] = [];

  // Add search filter
  if (search) {
    filters.push({
      OR: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { author: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { category: { has: search } },
        { ISBN: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    });
  }

  // Add individual field filters
  if (title)
    filters.push({
      title: { contains: title, mode: Prisma.QueryMode.insensitive },
    });
  if (author)
    filters.push({
      author: { contains: author, mode: Prisma.QueryMode.insensitive },
    });

  // Handle category filtering
  if (category) {
    if (Array.isArray(category)) {
      filters.push({
        category: { hasSome: category },
      });
    } else {
      filters.push({
        category: { has: category },
      });
    }
  }

  if (ISBN)
    filters.push({
      ISBN: { contains: ISBN, mode: Prisma.QueryMode.insensitive },
    });

  // Handle publishedYear and year range filters
  if (pubYear) {
    filters.push({ publishedYear: pubYear });
  } else if (pubYearStart && pubYearEnd) {
    filters.push({ publishedYear: { gte: pubYearStart, lte: pubYearEnd } });
  }

  // Add availability filter
  if (availabilityStatus === 'available') {
    filters.push({ copiesAvailable: { gt: 0 } });
  } else if (availabilityStatus === 'unavailable') {
    filters.push({ copiesAvailable: 0 });
  }

  // Define orderBy using Prisma.SortOrder
  const orderBy: Prisma.BookOrderByWithRelationInput | undefined = popularBooks
    ? { borrowCount: Prisma.SortOrder.desc }
    : undefined;

  return {
    where: filters.length > 0 ? { AND: filters } : {},
    orderBy,
  };
}
