import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ColumnModule } from 'src/column/column.module';

@Module({
  imports: [PrismaModule, ColumnModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
