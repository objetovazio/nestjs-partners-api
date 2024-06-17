import { Injectable } from '@nestjs/common';
import { CreateSpotDto } from './requests/create-spot.request';
import { UpdateSpotDto } from './requests/update-spot.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpotStatus } from '@prisma/client';

@Injectable()
export class SpotsService {
  constructor(private prismaService: PrismaService) { }
  async create(createSpotDto: CreateSpotDto & { eventId: string }) {
    const event = await this.prismaService.event.findFirst({
      where: {
        id: createSpotDto.eventId,
      },
    });

    if (!event) throw new Error('Event not found');

    return this.prismaService.spot.create({
      data: {
        ...createSpotDto,
        status: SpotStatus.avaiable,
      },
    });
  }

  findAll(eventId: string) {
    return this.prismaService.spot.findMany({
      where: {
        eventId: eventId,
      },
    });
  }

  findOne(eventId: string, spotId: string) {
    return this.prismaService.spot.findFirst({
      where: {
        id: spotId,
        eventId: eventId,
      },
    });
  }

  async update(spotId: string, updateSpotDto: UpdateSpotDto & { eventId: string }) {
    const event = await this.prismaService.event.findFirst({
      where: {
        id: updateSpotDto.eventId,
      },
    });

    if (!event) throw new Error('Event not found');

    return this.prismaService.spot.update({
      where: {
        id: spotId,
        eventId: updateSpotDto.eventId,
      },
      data: updateSpotDto,
    });
  }

  remove(eventId: string, spotId: string) {
    return this.prismaService.spot.delete({
      where: {
        id: spotId,
        eventId: eventId,
      },
    });
  }
}
