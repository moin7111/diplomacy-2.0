import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { EconomyModule } from './economy/economy.module';

@Module({
  imports: [PrismaModule, AuthModule, GameModule, ChatModule, EconomyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
