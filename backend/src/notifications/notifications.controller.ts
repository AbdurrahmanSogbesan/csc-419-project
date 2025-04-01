import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { QueryNotificationDto } from './dtos/query-notification.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query() queryParams: QueryNotificationDto,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.userId,
      queryParams,
    );
  }

  @Post()
  async createNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createDto);
  }

  @Get('count')
  async countUnread(@Request() req) {
    const count = await this.notificationsService.countUnreadNotifications(
      req.user.userId,
    );
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { success: true, message: 'All notifications marked as read' };
  }

  @Delete('delete-read')
  async deleteAllRead(@Request() req) {
    await this.notificationsService.deleteReadNotifications(req.user.userId);
    return { success: true, message: 'All read notifications deleted' };
  }

  @Post('issue-fine')
  @UseGuards(IsAdminGuard)
  async issueFine(
    @Body() data: { userId: bigint; bookId?: bigint; amount: number },
  ) {
    return await this.notificationsService.issueFine(
      data.userId,
      data.bookId,
      data.amount,
    );
  }

  @Post('waive-fine')
  @UseGuards(IsAdminGuard)
  async waiveFine(@Body() data: { userId: bigint; fineId: bigint }) {
    return await this.notificationsService.waiveFine(data.userId, data.fineId);
  }

  @Get(':id')
  async getNotification(@Param('id') id: bigint, @Request() req) {
    return await this.notificationsService.findOne(id, req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: bigint, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: bigint, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.userId);
    return { success: true, message: 'Notification deleted' };
  }
}
