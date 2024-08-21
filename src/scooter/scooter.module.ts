import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScooterService } from "./scooter.service";
import { ScooterController } from "./scooter.controller";
import { Scooter } from "./entities/scooter.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Scooter])],
  controllers: [ScooterController],
  providers: [ScooterService],
})
export class ScooterModule {}
