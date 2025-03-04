import { Prisma } from '@prisma/client';

export function buildBookFilters(params: {
  search?: string;
  title?: string;
  author?: string;
  category?: string;
  ISBN?: string;
  publishedYear?: number | string;
  publishedYearStart?: number | string;
  publishedYearEnd?: number | string;
  availabilityStatus?: string;
}): Prisma.BookWhereInput[] {
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
  } = params;

  // Convert string numbers to actual numbers if needed
  const pubYear = publishedYear ? Number(publishedYear) : undefined;
  const pubYearStart = publishedYearStart
    ? Number(publishedYearStart)
    : undefined;
  const pubYearEnd = publishedYearEnd ? Number(publishedYearEnd) : undefined;

  // Build filters as an array of conditions for AND
  const filters: Prisma.BookWhereInput[] = [];

  // Add search filter
  if (search) {
    filters.push({
      OR: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { author: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { category: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
  if (category)
    filters.push({
      category: { contains: category, mode: Prisma.QueryMode.insensitive },
    });
  if (ISBN)
    filters.push({
      ISBN: { contains: ISBN, mode: Prisma.QueryMode.insensitive },
    });

  // Handle publishedYear and year range filters
  if (pubYear) {
    // If publishedYear is provided, ignore publishedYearStart and publishedYearEnd
    filters.push({ publishedYear: pubYear });
  } else if (pubYearStart && pubYearEnd) {
    // If both publishedYearStart and publishedYearEnd are provided, create a range filter
    filters.push({
      publishedYear: {
        gte: pubYearStart,
        lte: pubYearEnd,
      },
    });
  }

  // Add availability filter
  if (availabilityStatus === 'available') {
    filters.push({ copiesAvailable: { gt: 0 } });
  } else if (availabilityStatus === 'unavailable') {
    filters.push({ copiesAvailable: 0 });
  }

  return filters;
}
