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
import { IsMineGuard } from 'src/common/guards/is-mine.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';
import { GetUsersDto } from './dtos/get-users.dto';

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
    return await this.authService.findOne(+req.user.userId);
  }

  @Patch('change-password')
  async changePassword(@Request() req, @Body() body) {
    return await this.authService.changePassword(req.user.userId, body);
  }

  @Get('stats')
  @UseGuards(IsAdminGuard)
  async getLibraryStats() {
    return this.authService.getLibraryStats();
  }

  @Get()
  @UseGuards(IsAdminGuard)
  async findAll(@Query() query: GetUsersDto) {
    return this.authService.findAllUsers(query);
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
  @UseGuards(IsAdminGuard)
  async deleteUser(@Param('id') id: number) {
    return await this.authService.deleteUser(+id);
  }

  @Patch(':id/restrict')
  @UseGuards(IsAdminGuard)
  async restrictUser(
    @Param('id') id: bigint,
    @Body() body: { restrictionDate?: string },
  ) {
    return await this.authService.restrictUser(id, body.restrictionDate);
  }

  @Patch(':id/unrestrict')
  @UseGuards(IsAdminGuard)
  async unrestrictUser(@Param('id') id: bigint) {
    return await this.authService.unrestrictUser(id);
  }
}
