import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.module';
import { ColumnService } from './column/column.service';
import { ColumnModule } from './column/column.module';
import { TaskModule } from './task/task.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    BoardModule,
    ColumnModule,
    TaskModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, ColumnService],
})
export class AppModule {}
