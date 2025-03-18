import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  FineStatus,
  Prisma,
  ReservationStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildBookFilters } from 'src/utils/book-query';
import { ReservationQueryDto } from './dtos/reservation-query.dto';

@Injectable()
export class ReservationService {
  private logger = new Logger(ReservationService.name);

  constructor(private prisma: PrismaService) {}

  // Run every day at midnight to check for expired pickup deadlines
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePickupDeadlines() {
    this.logger.log('Checking for expired pickup deadlines...');
    try {
      const now = new Date();

      return this.prisma.$transaction(async (tx) => {
        // Find reservations that have passed their 7-day pickup deadline
        const expiredReservations = await tx.reservation.findMany({
          where: {
            status: ReservationStatus.RESERVED,
            notified: true,
            reservedUntil: { lt: now },
          },
          include: {
            book: true,
            user: true,
          },
        });

        this.logger.log(
          `Found ${expiredReservations.length} expired reservations`,
        );

        for (const reservation of expiredReservations) {
          // Update reservation status to CANCELLED
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.CANCELLED },
          });

          this.logger.log(
            `Expired reservation for user ${reservation.user.name} (ID: ${reservation.userId}) and book "${reservation.book.title}" (ID: ${reservation.bookId}) has been cancelled`,
          );

          // Increment the available copies since the reserved book wasn't picked up
          await tx.book.update({
            where: { id: reservation.bookId },
            data: { copiesAvailable: { increment: 1 } },
          });
        }

        return { processed: expiredReservations.length };
      });
    } catch (error) {
      this.logger.error('Error processing pickup deadlines', error.stack);
      throw error;
    }
  }

  // Run every day at 9:00 AM to check for overdue books
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueBooks() {
    this.logger.log('Checking for overdue books...');
    try {
      const today = new Date();

      return this.prisma.$transaction(async (tx) => {
        // Find borrowed books that are overdue
        const overdueBooks = await tx.borrowedBook.findMany({
          where: {
            dueDate: { lt: today },
            returnDate: null,
          },
          include: {
            user: true,
            book: true,
          },
        });

        this.logger.log(`Found ${overdueBooks.length} overdue books`);

        for (const overdue of overdueBooks) {
          // Find the associated reservation and update status to OVERDUE
          const reservation = await tx.reservation.findFirst({
            where: {
              userId: overdue.userId,
              bookId: overdue.bookId,
              status: ReservationStatus.BORROWED,
            },
          });

          if (reservation) {
            await tx.reservation.update({
              where: { id: reservation.id },
              data: { status: ReservationStatus.OVERDUE },
            });
          }

          // Apply borrowing restriction to user
          const restrictedUntil = new Date();
          restrictedUntil.setMonth(restrictedUntil.getMonth() + 1); // Restricted for 1 month

          await tx.user.update({
            where: { id: overdue.userId },
            data: { restrictedUntil },
          });

          this.logger.log(
            `Book "${overdue.book.title}" is overdue from user ${overdue.user.name} (${overdue.user.email}). User is now restricted until ${restrictedUntil.toLocaleDateString()}.`,
          );

          // Send notification logic would go here
          // await this.notificationService.sendOverdueNotification(overdue);
        }

        return { overdue: overdueBooks.length };
      });
    } catch (error) {
      this.logger.error('Error checking overdue books', error.stack);
      throw error;
    }
  }

  // Clean up reservations that were notified but not picked up
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldReservations() {
    this.logger.log('Cleaning up expired reservations...');
    const now = new Date();

    try {
      // Find expired reservations
      const expiredReservations = await this.prisma.reservation.findMany({
        where: {
          reservedUntil: { lt: now },
          status: ReservationStatus.RESERVED,
          notified: true,
        },
      });

      if (expiredReservations.length === 0) {
        this.logger.log('No expired reservations to clean up.');
        return;
      }

      this.logger.log(
        `Cancelling ${expiredReservations.length} expired reservations...`,
      );

      for (const reservation of expiredReservations) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // Mark reservation as cancelled
            await tx.reservation.update({
              where: { id: reservation.id },
              data: { status: ReservationStatus.CANCELLED },
            });

            // Increment available copies since the reserved book wasn't picked up
            await tx.book.update({
              where: { id: reservation.bookId },
              data: { copiesAvailable: { increment: 1 } },
            });

            this.logger.log(
              `Reservation ${reservation.id} expired and cancelled.`,
            );
          });
        } catch (error) {
          this.logger.error(
            `Error processing reservation ${reservation.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Expired reservations cleanup completed.');
    } catch (error) {
      this.logger.error(`Failed to clean up reservations: ${error.message}`);
    }
  }

  // Reserve Book
  async reserveBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ reservation: any; message: string }> {
    return this.prisma.$transaction(async (tx) => {
      // Fetch user and check if they are restricted from borrowing
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new ForbiddenException(
          `You are restricted from reserving until ${user.restrictedUntil.toLocaleDateString()}`,
        );
      }

      // Check for unpaid fines
      const unpaidFines = await tx.fine.findMany({
        where: { userId, status: FineStatus.UNPAID },
      });

      if (unpaidFines.length > 0) {
        const totalAmount = unpaidFines.reduce(
          (sum, fine) => sum + fine.amount,
          0,
        );
        throw new ForbiddenException(
          `You have $${totalAmount.toFixed(2)} in unpaid fines. Please pay your fines to regain borrowing privileges.`,
        );
      }

      // Fetch book
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) throw new NotFoundException('Book not found');

      // Check if user already has this book reserved or borrowed
      const existingReservation = await tx.reservation.findFirst({
        where: {
          userId,
          bookId,
          status: {
            in: [ReservationStatus.RESERVED, ReservationStatus.BORROWED],
          },
        },
      });

      if (existingReservation) {
        throw new BadRequestException(
          'You already have this book reserved or borrowed',
        );
      }

      // Check if user has reached borrowing limit for the week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const borrowCount = await tx.borrowedBook.count({
        where: {
          userId,
          borrowDate: { gte: oneWeekAgo },
        },
      });

      if (borrowCount >= 5) {
        throw new ForbiddenException(
          'Borrow limit reached (5 books per week).',
        );
      }

      // Check if book is available
      if (book.copiesAvailable <= 0) {
        throw new BadRequestException(
          'Sorry, this book is currently unavailable.',
        );
      }

      // Book is available, create a RESERVED status
      const reservedUntil = new Date();
      reservedUntil.setDate(reservedUntil.getDate() + 7); // 7-day pickup deadline

      const reservation = await tx.reservation.create({
        data: {
          userId,
          bookId,
          status: ReservationStatus.RESERVED,
          notified: true,
          reservedUntil,
        },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Decrease available copies
      await tx.book.update({
        where: { id: bookId },
        data: {
          copiesAvailable: { decrement: 1 },
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          bookId,
          actionType: TransactionType.BORROW,
        },
      });

      return {
        reservation,
        message: `Book "${book.title}" reserved successfully. Please pick it up on/or before ${reservedUntil.toLocaleDateString()}.`,
      };
    });
  }

  // pick up a reserved book
  async pickupBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ borrowedBook: any; message: string }> {
    return this.prisma.$transaction(async (tx) => {
      // Check if the user has a valid reservation
      const reservation = await tx.reservation.findFirst({
        where: {
          userId,
          bookId,
          status: ReservationStatus.RESERVED,
          reservedUntil: { gte: new Date() },
        },
        include: {
          book: { select: { title: true, author: true } },
        },
      });

      if (!reservation) {
        throw new NotFoundException('No valid reservation found for this book');
      }

      if (reservation.reservedUntil < new Date()) {
        throw new BadRequestException('Reservation has expired');
      }

      if (reservation.status !== ReservationStatus.RESERVED) {
        throw new BadRequestException('Reservation status is not valid');
      }

      // Calculate due date (14-day return policy)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create borrowed book record with reservationId connection
      const borrowedBook = await tx.borrowedBook.create({
        data: {
          user: { connect: { id: userId } },
          book: { connect: { id: bookId } },
          dueDate: dueDate,
          reservation: { connect: { id: reservation.id } },
        },

        include: {
          book: {
            select: {
              author: true,
              category: true,
              title: true,
              copiesAvailable: true,
              imageUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reservation: true,
        },
      });

      // Update book borrowed count
      await tx.book.update({
        where: { id: bookId },
        data: {
          copiesBorrowed: { increment: 1 },
          borrowCount: { increment: 1 },
        },
      });

      // Update reservation status to BORROWED
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.BORROWED },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          bookId,
          actionType: TransactionType.BORROW,
        },
      });

      return {
        borrowedBook,
        message: `Book "${reservation.book.title}" checked out successfully. Due date: ${dueDate.toLocaleDateString()}.`,
      };
    });
  }

  async returnBook(
    userId: bigint,
    bookId: bigint,
  ): Promise<{ returnedBook: any; message: string; fine?: any }> {
    return this.prisma.$transaction(async (tx) => {
      const borrowedBook = await tx.borrowedBook.findFirst({
        where: { userId, bookId, returnDate: null },
        include: {
          book: { select: { title: true, author: true } },
          user: { select: { id: true, name: true, email: true } },
          reservation: true,
        },
      });

      if (!borrowedBook) {
        throw new NotFoundException('You have not borrowed this book');
      }

      const now = new Date();
      const isOverdue = now > borrowedBook.dueDate;
      let fine = null;
      let restrictionMessage = '';

      // Use the associated reservation from the relation instead of finding it again
      const reservation = borrowedBook.reservation;

      // Mark book as returned
      const returnedBook = await tx.borrowedBook.update({
        where: { id: borrowedBook.id },
        data: { returnDate: now },
        include: {
          book: {
            select: {
              author: true,
              category: true,
              title: true,
              copiesAvailable: true,
              imageUrl: true,
              id: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          reservation: true,
        },
      });

      // Update book availability
      await tx.book.update({
        where: { id: bookId },
        data: {
          copiesAvailable: { increment: 1 },
          copiesBorrowed: { decrement: 1 },
        },
      });

      // Record return transaction
      await tx.transaction.create({
        data: {
          userId,
          bookId,
          actionType: TransactionType.RETURN,
        },
      });

      // Update reservation status to RETURNED or OVERDUE
      if (reservation) {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            status: isOverdue
              ? ReservationStatus.OVERDUE
              : ReservationStatus.RETURNED,
          },
        });
      }

      // Handle overdue books
      if (isOverdue) {
        const daysOverdue = Math.ceil(
          (now.getTime() - borrowedBook.dueDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Apply restrictions for overdue returns
        const restrictedUntil = new Date();
        restrictedUntil.setMonth(restrictedUntil.getMonth() + 1); // 1 month restriction

        await tx.user.update({
          where: { id: userId },
          data: { restrictedUntil },
        });

        restrictionMessage = ` Your borrowing privileges are suspended until ${restrictedUntil.toLocaleDateString()}.`;

        // Calculate fine amount - $0.50 per day overdue
        const fineAmount = daysOverdue * 0.5;

        // Create fine record
        fine = await tx.fine.create({
          data: {
            userId,
            bookId,
            amount: fineAmount,
            status: FineStatus.UNPAID,
          },
        });
      }

      let message = `Book "${borrowedBook.book.title}" returned successfully.`;

      if (fine) {
        message += ` A fine of $${fine.amount.toFixed(2)} has been applied for ${Math.ceil(
          (now.getTime() - borrowedBook.dueDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )} days overdue.${restrictionMessage}`;
      }

      return { returnedBook, message, fine };
    });
  }

  async getReservations(query: ReservationQueryDto) {
    const {
      userId,
      bookId,
      status,
      startDate,
      endDate,
      notified,
      reservationId,
      page = '1',
      pageSize = '10',
      ...bookFilterParams
    } = query;

    // Build reservation-specific filters
    const filters: any = {};

    if (userId) filters.userId = BigInt(userId);
    if (bookId) filters.bookId = BigInt(bookId);
    if (status) filters.status = status;
    if (reservationId) filters.id = BigInt(reservationId);

    // Add date range filters
    if (startDate || endDate) {
      filters.reservationDate = {};
      if (startDate) filters.reservationDate.gte = new Date(startDate);
      if (endDate) filters.reservationDate.lte = new Date(endDate);
    }

    // Add notification status filter
    if (notified !== undefined) {
      filters.notified = notified === 'true';
    }

    // Use the utility function for book-related filters
    const { where: bookFilters, orderBy: bookOrderBy } =
      buildBookFilters(bookFilterParams);

    if (Object.keys(bookFilters).length > 0) {
      filters.book = bookFilters;
    }

    const pageNum = Number(page);
    const sizeNum = Number(pageSize);

    let orderByCondition:
      | Prisma.ReservationOrderByWithRelationInput
      | Prisma.ReservationOrderByWithRelationInput[];

    if (bookOrderBy) {
      if (Array.isArray(bookOrderBy)) {
        // Map array of book orders to reservation orders with nested book property
        orderByCondition = bookOrderBy.map((order) => ({
          book: order,
        })) as Prisma.ReservationOrderByWithRelationInput[];
      } else {
        orderByCondition = { book: bookOrderBy };
      }
    } else {
      // Default reservation ordering
      orderByCondition = { reservationDate: Prisma.SortOrder.desc };
    }

    const reservations = await this.prisma.reservation.findMany({
      where: filters,
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            ISBN: true,
            imageUrl: true,
            category: true,
            publishedYear: true,
          },
        },
        borrowedBook: {
          select: {
            id: true,
            borrowDate: true,
            dueDate: true,
            returnDate: true,
          },
        },
      },
      orderBy: orderByCondition,
    });

    const totalCount = await this.prisma.reservation.count({ where: filters });

    return {
      data: reservations,
      pagination: {
        total: totalCount,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(totalCount / sizeNum),
      },
    };
  }
}
