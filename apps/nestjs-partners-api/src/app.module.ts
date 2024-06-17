import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpotsController } from './spots/spots.controller';
import { SpotsModule } from './spots/spots.module';
import { SpotsService } from './spots/spots.service';

@Module({
  imports: [EventsModule, PrismaModule, SpotsModule],
  controllers: [AppController, SpotsController],
  providers: [AppService, SpotsService],
})
export class AppModule {}
