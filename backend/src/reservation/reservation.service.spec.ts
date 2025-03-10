import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationService } from './reservation.service';
import {
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ReservationStatus,
  FineStatus,
  TransactionType,
  Role,
} from '@prisma/client';

// jest.mock('@nestjs/common', () => {
//   const originalModule = jest.requireActual('@nestjs/common');

//   // Mock the Logger instance methods
//   const mockLoggerInstance = {
//     log: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn(),
//     debug: jest.fn(),
//     verbose: jest.fn(),
//   };

//   // Define the MockLogger type
//   type MockLoggerType = jest.Mock & {
//     overrideLogger: jest.Mock;
//   };

//   // Mock the Logger class, including static methods
//   const MockLogger = jest.fn(() => mockLoggerInstance) as MockLoggerType;
//   MockLogger.overrideLogger = jest.fn(); // Mock the static method

//   return {
//     ...originalModule,
//     Logger: MockLogger, // Replace the Logger with the mocked version
//   };
// });

describe('ReservationService', () => {
  let service: ReservationService;
  let prisma: PrismaService;

  // Sample data to reuse across tests
  const userId = BigInt(1);
  const bookId = BigInt(1);
  const reservationId = BigInt(1);
  const borrowedBookId = BigInt(1);
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in the future
  const pastDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days in the past

  const mockUser = {
    id: userId,
    uuid: 'user-uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    phone: '09054985795',
    role: Role.MEMBER,
    restrictedUntil: null,
    createdAt: currentDate,
  };

  const mockBook = {
    id: bookId,
    ISBN: '978-3-16-148410-0',
    title: 'Test Book',
    author: 'Test Author',
    description: 'A test book description.',
    pages: 200,
    category: ['Fiction', 'Adventure'],
    copiesAvailable: 5,
    copiesBorrowed: 0,
    publishedYear: 2020,
    imageUrl: 'https://example.com/test-book.jpg',
    language: 'English',
    borrowCount: 0,
    createdAt: currentDate,
  };

  const mockReservation = {
    id: reservationId,
    uuid: 'reservation-uuid-123',
    userId,
    bookId,
    status: ReservationStatus.RESERVED,
    reservationDate: currentDate,
    reservedUntil: futureDate,
    notified: false,
    user: { name: 'Test User', email: 'test@example.com' },
    book: { title: 'Test Book', author: 'Test Author' },
  };

  const mockBorrowedBook = {
    id: borrowedBookId,
    uuid: 'borrowed-book-uuid-123',
    userId,
    bookId,
    borrowDate: currentDate,
    dueDate: futureDate,
    returnDate: null,
    user: { name: 'Test User', email: 'test@example.com' },
    book: { title: 'Test Book', author: 'Test Author' },
  };

  const mockOverdueBorrowedBook = {
    ...mockBorrowedBook,
    dueDate: pastDate,
    user: mockUser,
    book: mockBook,
  };

  const mockFine = {
    id: BigInt(1),
    uuid: 'fine-uuid-123',
    userId,
    bookId,
    amount: 10.0,
    status: FineStatus.UNPAID,
    createdAt: currentDate,
    paidAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            fine: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
            book: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            reservation: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            borrowedBook: {
              count: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            transaction: {
              create: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prisma)),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks after each test
    jest.clearAllMocks();
  });

  describe('reserveBook', () => {
    it('should successfully reserve a book', async () => {
      // Mock user data
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      // Mock fines data (no unpaid fines)
      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([]);

      // Mock book data
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(mockBook);

      // Mock reservation data (no existing reservation)
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue(null);

      // Mock borrowed book count (within limit)
      jest.spyOn(prisma.borrowedBook, 'count').mockResolvedValue(0);

      // Mock reservation creation
      jest
        .spyOn(prisma.reservation, 'create')
        .mockResolvedValue(mockReservation);

      // Mock book update
      jest.spyOn(prisma.book, 'update').mockResolvedValue({
        ...mockBook,
        copiesAvailable: 4,
      });

      // Mock transaction creation
      jest.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: BigInt(1),
        uuid: 'transaction-uuid-123',
        userId,
        bookId,
        actionType: TransactionType.BORROW,
        timestamp: currentDate,
        amount: null,
      });

      const result = await service.reserveBook(userId, bookId);

      expect(result.message).toContain('reserved successfully');
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { copiesAvailable: { decrement: 1 } },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          bookId,
          actionType: TransactionType.BORROW,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is restricted', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        restrictedUntil: futureDate, // Restricted until future date
      });

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user has unpaid fines', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([mockFine]);

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if book does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(null);

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if book is unavailable', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue({
        ...mockBook,
        copiesAvailable: 0,
      });

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user already has an active reservation for the book', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(mockBook);
      jest
        .spyOn(prisma.reservation, 'findFirst')
        .mockResolvedValue(mockReservation);

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user exceeds maximum allowed borrowed books', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.fine, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(mockBook);
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue(null);
      // Assuming 5 is the limit for borrowing books
      jest.spyOn(prisma.borrowedBook, 'count').mockResolvedValue(5);

      await expect(service.reserveBook(userId, bookId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('pickupBook', () => {
    it('should successfully pick up a reserved book', async () => {
      // Mock reservation data
      jest
        .spyOn(prisma.reservation, 'findFirst')
        .mockResolvedValue(mockReservation);

      // Mock borrowed book creation
      jest
        .spyOn(prisma.borrowedBook, 'create')
        .mockResolvedValue(mockBorrowedBook);

      // Mock book update
      jest.spyOn(prisma.book, 'update').mockResolvedValue({
        ...mockBook,
        copiesBorrowed: 1,
        borrowCount: 1,
      });

      // Mock reservation update
      jest.spyOn(prisma.reservation, 'update').mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.BORROWED,
      });

      // Mock transaction creation
      jest.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: BigInt(2),
        uuid: 'transaction-uuid-456',
        userId,
        bookId,
        actionType: TransactionType.BORROW,
        timestamp: currentDate,
        amount: null,
      });

      const result = await service.pickupBook(userId, bookId);

      expect(result.message).toContain('checked out successfully');
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: { status: ReservationStatus.BORROWED },
      });
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          copiesBorrowed: { increment: 1 },
          borrowCount: { increment: 1 },
        },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          bookId,
          actionType: TransactionType.BORROW,
        },
      });
    });

    it('should throw NotFoundException if no valid reservation is found', async () => {
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue(null);

      await expect(service.pickupBook(userId, bookId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if reservation has expired', async () => {
      const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // 1 day in the past

      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue({
        ...mockReservation,
        reservedUntil: pastDate, // Expired
      });

      await expect(service.pickupBook(userId, bookId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if reservation status is not RESERVED', async () => {
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.pickupBook(userId, bookId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('returnBook', () => {
    it('should successfully return a book', async () => {
      const overdueDate = new Date(
        currentDate.getTime() - 3 * 24 * 60 * 60 * 1000,
      ); // 3 days overdue

      const overdueBorrowedBook = {
        ...mockBorrowedBook,
        dueDate: overdueDate,
      };

      // Mock borrowed book data
      jest
        .spyOn(prisma.borrowedBook, 'findFirst')
        .mockResolvedValue(overdueBorrowedBook);

      // Mock returned book data
      jest.spyOn(prisma.borrowedBook, 'update').mockResolvedValue({
        ...overdueBorrowedBook,
        returnDate: currentDate,
      });

      // Mock book update
      jest.spyOn(prisma.book, 'update').mockResolvedValue({
        ...mockBook,
        copiesAvailable: 6,
        copiesBorrowed: 0,
      });

      // Mock fine creation for overdue book
      jest.spyOn(prisma.fine, 'create').mockResolvedValue({
        ...mockFine,
        amount: 3, // $1 per day for 3 days
      });

      // Mock transaction creation
      jest.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: BigInt(3),
        uuid: 'transaction-uuid-789',
        userId,
        bookId,
        actionType: TransactionType.RETURN,
        timestamp: currentDate,
        amount: null,
      });

      const result = await service.returnBook(userId, bookId);

      expect(result.message).toContain('returned successfully');
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          copiesAvailable: { increment: 1 },
          copiesBorrowed: { decrement: 1 },
        },
      });
      expect(prisma.fine.create).toHaveBeenCalled();
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          bookId,
          actionType: TransactionType.RETURN,
        },
      });
    });

    it('should throw NotFoundException if no borrowed book is found', async () => {
      jest.spyOn(prisma.borrowedBook, 'findFirst').mockResolvedValue(null);

      await expect(service.returnBook(userId, bookId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not create a fine if book is returned before due date', async () => {
      const futureDueDate = new Date(
        currentDate.getTime() + 3 * 24 * 60 * 60 * 1000,
      ); // Due in 3 days

      const nonOverdueBorrowedBook = {
        ...mockBorrowedBook,
        dueDate: futureDueDate,
      };

      // Mock borrowed book data
      jest
        .spyOn(prisma.borrowedBook, 'findFirst')
        .mockResolvedValue(nonOverdueBorrowedBook);

      // Mock returned book data
      jest.spyOn(prisma.borrowedBook, 'update').mockResolvedValue({
        ...nonOverdueBorrowedBook,
        returnDate: currentDate,
      });

      // Mock book update
      jest.spyOn(prisma.book, 'update').mockResolvedValue({
        ...mockBook,
        copiesAvailable: 6,
        copiesBorrowed: 0,
      });

      // Mock transaction creation
      jest.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: BigInt(3),
        uuid: 'transaction-uuid-789',
        userId,
        bookId,
        actionType: TransactionType.RETURN,
        timestamp: currentDate,
        amount: null,
      });

      await service.returnBook(userId, bookId);

      expect(prisma.fine.create).not.toHaveBeenCalled();
    });
  });

  describe('handlePickupDeadlines', () => {
    it('should handle expired reservations', async () => {
      const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // 1 day in the past

      const expiredReservation = {
        ...mockReservation,
        id: BigInt(1),
        reservedUntil: pastDate, // Expired
      };

      const expiredReservation2 = {
        ...mockReservation,
        id: BigInt(2),
        bookId: BigInt(2),
        reservedUntil: pastDate, // Expired
      };

      // Mock finding expired reservations
      jest
        .spyOn(prisma.reservation, 'findMany')
        .mockResolvedValue([expiredReservation, expiredReservation2]);

      // Mock updating reservations
      const updateMock = jest.spyOn(prisma.reservation, 'update');
      updateMock.mockResolvedValueOnce({
        ...expiredReservation,
        status: ReservationStatus.CANCELLED,
      });
      updateMock.mockResolvedValueOnce({
        ...expiredReservation2,
        status: ReservationStatus.CANCELLED,
      });

      // Mock updating books
      const bookUpdateMock = jest.spyOn(prisma.book, 'update');
      bookUpdateMock.mockResolvedValueOnce({
        ...mockBook,
        copiesAvailable: 6,
      });
      bookUpdateMock.mockResolvedValueOnce({
        ...mockBook,
        id: BigInt(2),
        copiesAvailable: 6,
      });

      const result = await service.handlePickupDeadlines();

      expect(result.processed).toBe(2);
      expect(prisma.reservation.update).toHaveBeenCalledTimes(2);
      expect(prisma.book.update).toHaveBeenCalledTimes(2);
    });

    it('should return 0 processed if no expired reservations', async () => {
      // Mock finding no expired reservations
      jest.spyOn(prisma.reservation, 'findMany').mockResolvedValue([]);

      const result = await service.handlePickupDeadlines();

      expect(result.processed).toBe(0);
      expect(prisma.reservation.update).not.toHaveBeenCalled();
      expect(prisma.book.update).not.toHaveBeenCalled();
    });
  });

  describe('checkOverdueBooks', () => {
    it('should mark books as overdue and restrict users', async () => {
      // Mock data for overdue books
      const mockOverdueBooks = [
        mockOverdueBorrowedBook,
        {
          ...mockOverdueBorrowedBook,
          id: BigInt(2),
          uuid: 'borrowed-book-uuid-456',
          userId: BigInt(2),
          bookId: BigInt(2),
          user: {
            ...mockUser,
            id: BigInt(2),
            name: 'User 2',
            email: 'user2@example.com',
          },
          book: { ...mockBook, id: BigInt(2), title: 'Book 2' },
        },
      ];

      const mockActiveReservation = {
        id: BigInt(1),
        uuid: 'some-uuid-string-1',
        userId,
        bookId,
        status: ReservationStatus.BORROWED,
        reservationDate: currentDate,
        reservedUntil: futureDate,
        notified: false,
        user: { name: 'Test User', email: 'test@example.com' },
        book: { title: 'Test Book', author: 'Test Author' },
      };

      const mockActiveReservation2 = {
        id: BigInt(2),
        uuid: 'some-uuid-string-2',
        userId,
        bookId,
        status: ReservationStatus.BORROWED,
        reservationDate: currentDate,
        reservedUntil: futureDate,
        notified: false,
        user: { name: 'Test User', email: 'test@example.com' },
        book: { title: 'Test Book', author: 'Test Author' },
      };

      // Setup mocks
      jest
        .spyOn(prisma.borrowedBook, 'findMany')
        .mockResolvedValue(mockOverdueBooks);
      jest
        .spyOn(prisma.reservation, 'findFirst')
        .mockResolvedValueOnce(mockActiveReservation)
        .mockResolvedValueOnce(mockActiveReservation2);
      jest.spyOn(prisma.reservation, 'update').mockResolvedValue({} as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      // Execute
      await service.checkOverdueBooks();

      // Verify Prisma interactions
      expect(prisma.borrowedBook.findMany).toHaveBeenCalled();
      expect(prisma.reservation.update).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it('should handle books without associated reservations', async () => {
      // Setup mocks
      jest
        .spyOn(prisma.borrowedBook, 'findMany')
        .mockResolvedValue([mockOverdueBorrowedBook]);
      jest.spyOn(prisma.reservation, 'findFirst').mockResolvedValue(null); // No reservation found
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      // Execute function
      const result = await service.checkOverdueBooks();

      // Verify function executed correctly
      expect(prisma.borrowedBook.findMany).toHaveBeenCalled();
      expect(prisma.reservation.findFirst).toHaveBeenCalled();

      // Should still update user even without reservation
      expect(prisma.reservation.update).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ overdue: 1 });
    });

    it('should handle empty overdue books list', async () => {
      // Setup mocks
      jest.spyOn(prisma.borrowedBook, 'findMany').mockResolvedValue([]);

      // Execute function
      const result = await service.checkOverdueBooks();

      // Verify function executed correctly
      expect(prisma.borrowedBook.findMany).toHaveBeenCalled();
      expect(prisma.reservation.findFirst).not.toHaveBeenCalled();
      expect(prisma.reservation.update).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(result).toEqual({ overdue: 0 });
    });

    it('should handle errors correctly', async () => {
      const errorMessage = 'Database error';
      const error = new Error(errorMessage);

      // Mock transaction to reject
      prisma.$transaction = jest.fn().mockRejectedValueOnce(error);

      // Execute the function
      await expect(service.checkOverdueBooks()).rejects.toThrow(errorMessage);
    });
  });
});
