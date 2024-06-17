import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { timingSafeEqual } from 'crypto';
import { reserveSpotDto } from './dto/reserve-spot.dto';
import { Prisma, SpotStatus, TicketStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}

  create(createEventDto: CreateEventDto) {
    return this.prismaService.event.create({
      data: createEventDto,
    });
  }

  findAll() {
    return this.prismaService.event.findMany();
  }

  findOne(id: string) {
    return this.prismaService.event.findUnique({
      where: { id: id },
    });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.prismaService.event.update({
      where: { id: id },
      data: updateEventDto,
    });
  }

  remove(id: string) {
    return this.prismaService.event.delete({
      where: { id: id },
    });
  }

  removeAll() {
    return this.prismaService.event.deleteMany();
  }

  async reserveSpot(dto: reserveSpotDto & { eventId: string }) {
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: dto.eventId,
        name: {
          in: dto.spots,
        },
      },
    });

    // Check if could fetch all spots
    if (spots.length !== dto.spots.length) {
      const foundSpotsName = spots.map((spot) => spot.name);
      const notFoundSpots = dto.spots.filter(
        (spotName) => !foundSpotsName.includes(spotName),
      );

      throw new Error(`Spots ${notFoundSpots.join(', ')} not found.`);
    }

    try {
      const tickets = await this.prismaService.$transaction(
        async (prisma) => {
          // Creates the history reservation
          await prisma.reservationHistory.createMany({
            data: spots.map((spot) => ({
              spotId: spot.id,
              ticketKind: dto.ticket_kind,
              email: dto.email,
              status: TicketStatus.reserved,
            })),
          });

          // Update spots
          await prisma.spot.updateMany({
            where: {
              id: {
                in: spots.map((spot) => spot.id),
              },
            },
            data: {
              status: SpotStatus.reserved,
            },
          });

          // Create Ticket
          const tickets = await Promise.all(
            spots.map((spot) => {
              return prisma.ticket.create({
                data: {
                  spotId: spot.id,
                  ticketKind: dto.ticket_kind,
                  email: dto.email,
                },
              });
            }),
          );

          return tickets;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
      );

      return tickets;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002':
          case 'P2034':
            throw new Error('Some Spots already reserved');
        }
        throw e;
      }
    }
  }
}
