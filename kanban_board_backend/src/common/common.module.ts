import { Module } from '@nestjs/common';
import { BoardAccessGuard } from './guards/board-access.guard';
import { BoardOwnerGuard } from './guards/board-owner.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  providers: [BoardAccessGuard, BoardOwnerGuard],
  exports: [BoardAccessGuard, BoardOwnerGuard],
})
export class CommonModule {}
