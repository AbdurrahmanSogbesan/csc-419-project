import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthResponse } from './interfaces/users-login.interfaces';
// import { IsAdminGuard } from 'src/common/guards/is-admin.guard';
import { Role } from '@prisma/client';
import { IsMineGuard } from 'src/common/guards/is-mine.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @Public()
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<AuthResponse> {
    return await this.authService.loginUser(loginUserDto);
  }

  @Get('me')
  async me(@Request() req) {
    return req.user;
  }

  @Get('stats')
  @UseGuards(IsAdminGuard)
  async getLibraryStats() {
    return this.authService.getLibraryStats();
  }

  @Get()
  @UseGuards(IsAdminGuard)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('role') role?: Role,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    return await this.authService.findAll({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @UseGuards(IsAdminGuard)
  async findOne(@Param('id') id: number) {
    return await this.authService.findOne(+id);
  }

  @UseGuards(IsMineGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.authService.updateUser(+id, updateUserDto);
  }

  @Delete(':id/delete')
  @UseGuards(IsMineGuard)
  async deleteUser(@Param('id') id: number) {
    return await this.authService.deleteUser(+id);
  }
}
