import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ColumnModule } from 'src/column/column.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, ColumnModule, CommonModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
