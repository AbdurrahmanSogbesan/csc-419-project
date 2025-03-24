// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, FineStatus, Prisma } from '@prisma/client';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { QueryNotificationDto } from './dtos/query-notification.dto';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService) {}

  async createNotification(data: CreateNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          user: {
            connect: {
              id: data.userId,
            },
          },
          ...(data.bookId
            ? {
                book: {
                  connect: {
                    id: data.bookId,
                  },
                },
              }
            : {}),
          ...(data.reservationId
            ? {
                reservation: {
                  connect: {
                    id: data.reservationId,
                  },
                },
              }
            : {}),
        },
      });
    } catch (error) {
      this.logger.error(
        `Error creating notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markAsRead(notificationId: bigint, userId: bigint) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: bigint) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUserNotifications(userId: number, options?: QueryNotificationDto) {
    const {
      page = 1,
      pageSize = 10,
      includeRead = false,
      includeRelations = true,
    } = options || {};

    const filters: Prisma.NotificationWhereInput = {
      userId,
      ...(includeRead ? {} : { isRead: false }),
    };
    console.log(
      '🚀 ~ NotificationsService ~ getUserNotifications ~ filters:',
      filters,
    );

    const totalCount = await this.prisma.notification.count({ where: filters });

    const notifications = await this.prisma.notification.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: includeRelations
        ? {
            book: { select: { id: true, title: true } },
            reservation: { select: { id: true, status: true } },
          }
        : {},
    });
    console.log(
      '🚀 ~ NotificationsService ~ getUserNotifications ~ notifications:',
      notifications,
    );

    return {
      data: notifications,
      pagination: {
        total: totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  async findOne(id: bigint, userId: bigint) {
    return this.prisma.notification.findUnique({
      where: { id, userId },
    });
  }

  async countUnreadNotifications(userId: bigint) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async deleteNotification(notificationId: bigint, userId: bigint) {
    return this.prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  }

  async deleteReadNotifications(userId: bigint) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
  }

  async notifyBookDueSoon(
    userId: bigint,
    bookId: bigint,
    bookTitle: string,
    dueDate: Date,
  ) {
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.createNotification({
      userId,
      type: NotificationType.BOOK_DUE_SOON,
      title: 'Book due soon',
      message: `"${bookTitle}" is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. Please return it to avoid fines.`,
      bookId,
    });
  }

  async notifyBookOverdue(
    userId: bigint,
    bookId: bigint,
    bookTitle: string,
    dueDate: Date,
  ) {
    const daysOverdue = Math.ceil(
      (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.createNotification({
      userId,
      type: NotificationType.BOOK_OVERDUE,
      title: 'Book overdue',
      message: `"${bookTitle}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue. Please return it as soon as possible to minimize fines.`,
      bookId,
    });
  }

  async issueFine(userId: bigint, bookId: bigint | null, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const bookTitle = bookId
        ? (
            await tx.book.findUnique({
              where: { id: bookId },
              select: { title: true },
            })
          )?.title
        : null;

      const fine = await tx.fine.create({
        data: { userId, bookId, amount, status: FineStatus.UNPAID },
      });

      await tx.notification.create({
        data: {
          type: NotificationType.FINE_ISSUED,
          title: 'Fine issued',
          message: bookTitle
            ? `A fine of $${amount.toFixed(2)} has been issued for overdue book "${bookTitle}".`
            : `A fine of $${amount.toFixed(2)} has been added to your account.`,
          userId,
          bookId,
        },
      });

      return fine;
    });
  }
}
