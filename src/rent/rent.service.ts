import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rent } from "./entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter } from "../scooter/entities/scooter.entity";
import { CreateRentDto } from "./dto/create-rent.dto";
import { UpdateRentDto } from "./dto/update-rent.dto";

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Scooter)
    private scooterRepository: Repository<Scooter>
  ) {}

  async create(createRentDto: CreateRentDto): Promise<Rent> {
    /*
    1. Check
        I. Rent
            - scooter is already rented by someone
            - user is already rent a scooter
        II. User
            - id is in DB or not
            - status is avtive or not
        III. Scooter
            - id is in DB or not
            - status is availiable or not
    */
    const user = await this.userRepository.findOne({
      where: { id: createRentDto.userId },
    });

    const rent = this.rentRepository.create(createRentDto);
    return await this.rentRepository.save(rent);
  }

  async findAll(): Promise<Rent[]> {
    return await this.rentRepository.find();
  }

  async findOne(id: number): Promise<Rent> {
    const rent = await this.rentRepository.findOne({ where: { id } });
    if (!rent) {
      throw new NotFoundException(`Rent with ID ${id} not found`);
    }
    return rent;
  }

  async update(id: number, updateRentDto: UpdateRentDto): Promise<Rent> {
    const rent = await this.findOne(id);
    this.rentRepository.merge(rent, updateRentDto);
    return await this.rentRepository.save(rent);
  }

  async remove(id: number): Promise<void> {
    const rent = await this.findOne(id);
    await this.rentRepository.remove(rent);
  }
}
