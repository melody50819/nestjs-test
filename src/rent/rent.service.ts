import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rent } from "./entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter, ScooterStatus } from "../scooter/entities/scooter.entity";
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

  async checkExistRent(user: User): Promise<void> {
    const existingRent = await this.rentRepository.findOne({
      where: { userId: user, endTime: null },
    });
    if (existingRent) {
      throw new BadRequestException("User already has an active rent");
    }
  }

  async checkUser(user: User): Promise<void> {
    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (!user.isCertified) {
      throw new BadRequestException("User is not certified");
    }
  }

  async checkScooter(scooter: Scooter): Promise<void> {
    if (!scooter) {
      throw new BadRequestException("User not found");
    }

    // 檢查車輛是否可用
    if (scooter.status !== ScooterStatus.AVAILABLE) {
      throw new BadRequestException("Scooter is not available");
    }
  }

  async create(createRentDto: CreateRentDto): Promise<Rent> {
    const { userId, scooterId } = createRentDto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const scooter = await this.scooterRepository.findOne({
      where: { id: scooterId },
    });

    await this.checkUser(user); // 檢查用戶認證狀態
    await this.checkExistRent(user); // 檢查用戶是否已經租借了一台車
    await this.checkScooter(scooter); // 檢查車輛是否可用

    // 創建新的租借記錄
    const newRent = new Rent();
    newRent.userId = user;
    newRent.scooterId = scooter;

    // 更新車輛狀態
    scooter.status = ScooterStatus.INUSE;
    await this.scooterRepository.save(scooter);

    return this.rentRepository.save(newRent);
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

  async remove(id: number): Promise<void> {
    const rent = await this.findOne(id);
    await this.rentRepository.remove(rent);
  }
}
