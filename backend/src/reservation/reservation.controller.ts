import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ReservationQueryDto } from './dtos/reservation-query.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async getReservations(@Query() query: ReservationQueryDto, @Request() req) {
    return this.reservationService.getReservations({
      ...query,
      userId: req.user.userId,
    });
  }

  @Public()
  @Post('trigger-pickup-deadline-check')
  async triggerPickupDeadlineCheck() {
    return this.reservationService.handlePickupDeadlines();
  }

  @Public()
  @Post('trigger-overdue-check')
  async triggerOverdueCheck() {
    return this.reservationService.checkOverdueBooks();
  }

  @Public()
  @Post('cleanup-old-reservations')
  async cleanupOldReservation() {
    return this.reservationService.cleanupOldReservations();
  }

  // Admin/Librarian endpoints for manual notification triggers
  @Post('trigger-due-soon')
  @UseGuards(IsAdminGuard)
  async triggerDueSoonNotifications() {
    await this.reservationService.sendDueSoonNotifications();
    return { success: true, message: 'Due soon notifications triggered' };
  }

  @Post('trigger-overdue')
  @UseGuards(IsAdminGuard)
  async triggerOverdueNotifications() {
    await this.reservationService.sendOverdueNotifications();
    return { success: true, message: 'Overdue notifications triggered' };
  }

  @Post('trigger-reservation-available')
  @UseGuards(IsAdminGuard)
  async triggerReservationAvailableNotifications() {
    await this.reservationService.notifyReservationAvailable();
    return {
      success: true,
      message: 'Reservation available notifications triggered',
    };
  }

  @Post(':bookId/reserve')
  async reserveBook(@Request() req, @Param('bookId') id: bigint) {
    return await this.reservationService.reserveBook(req.user.userId, id);
  }

  @Post(':bookId/pickUp')
  async pickUpBook(@Request() req, @Param('bookId') id: bigint) {
    return await this.reservationService.pickupBook(req.user.userId, id);
  }

  @Post(':bookId/return')
  async returnBook(@Request() req, @Param('bookId') id: bigint) {
    return await this.reservationService.returnBook(req.user.userId, id);
  }
}
