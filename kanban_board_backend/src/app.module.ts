import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
