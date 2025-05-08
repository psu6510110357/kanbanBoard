import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
