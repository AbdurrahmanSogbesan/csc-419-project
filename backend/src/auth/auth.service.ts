import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { hashPassword } from 'src/utils/helpers';
import {
  LoginResponse,
  UserPayload,
} from './interfaces/users-login.interfaces';
import { LoginUserDto } from './dtos/login-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // User Registration
  async registerUser(createUserDto: CreateUserDto) {
    const { email, password, name, ...userData } = createUserDto;

    try {
      // Step 1: Hash the password
      const hashedPassword = await hashPassword(password);

      // Step 3: Save user with unique slug and hashed password
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          ...userData,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      // Step 1: Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
      });

      // Step 2: Check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Step 3: Verify password
      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Step 4: Create JWT payload
      const payload: UserPayload = {
        sub: user.uuid,
        userId: user.id.toString(),
        email: user.email,
        name: `${user.name}`,
      };

      // Step 5: Sign and return JWT token
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    } = {},
  ) {
    const { skip, take = 10, cursor, where, orderBy } = params;

    const users = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const total = await this.prisma.user.count({ where });

    return {
      users,
      total,
      pagination: {
        currentPage: Math.floor((skip || 0) / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,

        //Include related data
        borrowedBooks: {
          select: {
            id: true,
            book: true,
            borrowDate: true,
            returnDate: true,
          },
          take: 5, // Limit recent orders
          orderBy: { borrowDate: 'desc' },
        },
      },
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
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
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
}
