import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { comparePasswords, hashPassword } from 'src/utils/helpers';
import { AuthResponse, UserPayload } from './interfaces/users-login.interfaces';
import { LoginUserDto } from './dtos/login-user.dto';
import { NotificationType, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private getUserSelectFields() {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,

      borrowedBooks: true,
      reservations: true,
    };
  }

  private async generateAuthResponse(user: any): Promise<AuthResponse> {
    const payload: UserPayload = {
      sub: user.uuid,
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user; // Exclude password if it exists(Unnecessary but standard practice)

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleRestrictionExpiry() {
    try {
      const currentDate = new Date();

      const expiredRestrictions = await this.prisma.user.findMany({
        where: {
          isRestricted: true,
          restrictedUntil: {
            lt: currentDate,
            not: null,
          },
        },
      });

      if (!expiredRestrictions.length) {
        this.logger.log('No users with expired restrictions found');
        return;
      }

      for (const user of expiredRestrictions) {
        await this.prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: {
              isRestricted: false,
              restrictedUntil: null,
            },
          });

          await tx.notification.create({
            data: {
              userId: user.id,
              type: NotificationType.ACCOUNT_UNRESTRICTED,
              title: 'Account Restriction Removed',
              message:
                'Your account restriction has been lifted. You can now use the library services normally.',
              createdAt: new Date(),
            },
          });
        });
      }

      this.logger.log(
        `Removed restrictions for ${expiredRestrictions.length} users`,
      );
    } catch (error) {
      this.logger.error('Error handling restriction expiry', error);
      throw error;
    }
  }

  async registerUser(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const { email, password, name, ...userData } = createUserDto;

    try {
      const hashedPassword = await hashPassword(password);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          ...userData,
        },
        select: {
          id: true,
          uuid: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
        select: {
          id: true,
          uuid: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          password: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async changePassword(
    userId: bigint,
    data: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = data;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async findAllUsers(query: GetUsersDto) {
    const { page = 1, pageSize = 10, search, role } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uuid: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          phone: true,
          restrictedUntil: true,
          borrowedBooks: {
            select: {
              id: true,
              bookId: true,
              dueDate: true,
              returnDate: true,
            },
          },
          reservations: {
            select: {
              id: true,
              bookId: true,
              status: true,
              reservationDate: true,
            },
          },
          savedBooks: {
            select: {
              id: true,
              bookId: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: this.getUserSelectFields(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      const updatedPassword = updateUserDto.password
        ? await hashPassword(updateUserDto.password)
        : user.password;

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          password: updatedPassword,
        },
        select: this.getUserSelectFields(),
      });
      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Email or slug already exists');
      }
      throw new HttpException(error, 500);
    }
  }

  async deleteUser(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Perform delete operation
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: `User ${deletedUser.name} has been deleted`,
      user: deletedUser,
    };
  }

  async getLibraryStats() {
    const totalBooks = await this.prisma.book.count();

    const totalLendedBooks = await this.prisma.borrowedBook.count();

    const currentlyLendedBooks = await this.prisma.borrowedBook.count({
      where: { returnDate: null },
    });

    const availableBooks = await this.prisma.book.count({
      where: { copiesAvailable: { gt: 0 } },
    });

    const totalUsers = await this.prisma.user.count({
      where: { role: 'MEMBER' },
    });

    const overdueBooks = await this.prisma.borrowedBook.count({
      where: {
        returnDate: null,
        dueDate: { lt: new Date() },
      },
    });

    return {
      totalBooks,
      totalLendedBooks,
      currentlyLendedBooks,
      availableBooks,
      totalUsers,
      overdueBooks,
    };
  }

  async restrictUser(userId: bigint, restrictionDate?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isRestricted || user.restrictedUntil) {
      throw new ConflictException('User is already restricted');
    }

    let parsedDate: Date | null = null;
    if (restrictionDate) {
      parsedDate = new Date(restrictionDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid restriction date format');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          restrictedUntil: parsedDate,
          isRestricted: true,
        },
      });

      // Format date nicely for notification
      const dateMessage = parsedDate
        ? `Your account has been restricted until ${parsedDate.toLocaleDateString()}`
        : 'Your account has been restricted indefinitely';

      await tx.notification.create({
        data: {
          userId,
          title: 'Account Restricted',
          message: dateMessage,
          type: NotificationType.ACCOUNT_RESTRICTED,
        },
      });

      return updatedUser;
    });
  }

  async unrestrictUser(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isRestricted: false,
          restrictedUntil: null,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Account Unrestricted',
          message: `Your account has been unrestricted`,
          type: NotificationType.ACCOUNT_UNRESTRICTED,
        },
      });

      return updatedUser;
    });
  }
}
