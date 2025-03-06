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
import { AuthResponse, UserPayload } from './interfaces/users-login.interfaces';
import { LoginUserDto } from './dtos/login-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class AuthService {
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

      // Include related data
      borrowedBooks: {
        select: {
          id: true,
          book: true,
          borrowDate: true,
          returnDate: true,
        },
        take: 10, // Limit to recent borrowings
        orderBy: { borrowDate: 'desc' as const },
      },
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
        uuid: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        phone: true,
        borrowedBooks: true,
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
}
