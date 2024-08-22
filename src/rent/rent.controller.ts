import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  create(@Body() createRentDto: CreateRentDto) {
    if (!createRentDto.userId) {
      throw new BadRequestException("userId is required");
    }
    if (!createRentDto.scooterId) {
      throw new BadRequestException("scooterId is required");
    }
    return this.rentService.create(createRentDto);
  }

  @Get()
  findAll() {
    return this.rentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rentService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.rentService.remove(+id);
  }
}
