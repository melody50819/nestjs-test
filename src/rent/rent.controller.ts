import {
  Controller,
  Post,
  Body,
  Patch,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RentService } from "./rent.service";
import { CreateRentDto } from "./dto/create-rent.dto";
import { UpdateRentDto } from "./dto/update-rent.dto";

@ApiTags("rent")
@Controller("rent")
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  async create(@Body() createRentDto: CreateRentDto) {
    if (!createRentDto.userId) {
      throw new BadRequestException("userId is required");
    }
    if (!createRentDto.scooterId) {
      throw new BadRequestException("scooterId is required");
    }
    return this.rentService.create(createRentDto);
  }

  @Patch("return")
  async return(@Body() updateRentDto: UpdateRentDto) {
    await this.rentService.return(updateRentDto);
  }
}
