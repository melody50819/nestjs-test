import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Scooter } from "./entities/scooter.entity";
import { CreateScooterDto } from "./dto/create-scooter.dto";
import { UpdateScooterDto } from "./dto/update-scooter.dto";

@Injectable()
export class ScooterService {
  constructor(
    @InjectRepository(Scooter)
    private scooterRepository: Repository<Scooter>
  ) {}

  async create(createScooterDto: CreateScooterDto): Promise<Scooter> {
    const scooter = this.scooterRepository.create(createScooterDto);
    return await this.scooterRepository.save(scooter);
  }

  async findAll(): Promise<Scooter[]> {
    return await this.scooterRepository.find();
  }

  async findOne(id: number): Promise<Scooter> {
    const scooter = await this.scooterRepository.findOne({ where: { id } });
    if (!scooter) {
      throw new NotFoundException(`Scooter with ID ${id} not found`);
    }
    return scooter;
  }

  async update(
    id: number,
    updateScooterDto: UpdateScooterDto
  ): Promise<Scooter> {
    const scooter = await this.findOne(id);
    this.scooterRepository.merge(scooter, updateScooterDto);
    return await this.scooterRepository.save(scooter);
  }

  async remove(id: number): Promise<void> {
    const scooter = await this.findOne(id);
    await this.scooterRepository.remove(scooter);
  }
}
