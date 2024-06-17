import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpotsService } from '@app/core/spots/spots.service';
import { CreateSpotRequest } from './requests/create-spot.request';
import { UpdateSpotRequest } from './requests/update-spot.request';

@Controller('events/:eventId/spots')
export class SpotsController {
  constructor(private readonly spots: SpotsService) {}

  @Post()
  create(
    @Body() createSpotRequest: CreateSpotRequest,
    @Param('eventId') eventId: string,
  ) {
    return this.spots.create({ ...createSpotRequest, eventId });
  }

  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.spots.findAll(eventId);
  }

  @Get(':spotId')
  findOne(@Param('spotId') spotId: string, @Param('eventId') eventId: string) {
    return this.spots.findOne(eventId, spotId);
  }

  @Patch(':spotId')
  update(
    @Param('spotId') spotId: string,
    @Param('eventId') eventId: string,
    @Body() updateSpotRequest: UpdateSpotRequest,
  ) {
    return this.spots.update(spotId, { ...updateSpotRequest, eventId });
  }

  @Delete(':spotId')
  remove(@Param('spotId') spotId: string, @Param('eventId') eventId: string) {
    return this.spots.remove(eventId, spotId);
  }
}
