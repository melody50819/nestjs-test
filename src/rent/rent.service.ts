import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { Rent } from "./entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter, ScooterStatus } from "../scooter/entities/scooter.entity";
import { CreateRentDto } from "./dto/create-rent.dto";
import { UpdateRentDto } from "./dto/update-rent.dto";

@Injectable()
export class RentService {
  constructor(private dataSource: DataSource) {}

  async checkIsReturn(user: User, manager: EntityManager): Promise<boolean> {
    const existingRent = await manager.findOne(Rent, {
      where: { userId: user, endTime: null },
      order: { startTime: "DESC" },
    });

    if (!existingRent) {
      // first time rent
      return true;
    }

    return existingRent.endTime !== null;
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
      throw new BadRequestException("Scooter not found");
    }

    // 檢查車輛是否可用
    if (scooter.status !== ScooterStatus.AVAILABLE) {
      throw new BadRequestException("Scooter is not available");
    }
  }

  async checkRent(rent: Rent): Promise<void> {
    if (!rent) {
      console.log("Rent not found, throwing NotFoundException");
      throw new NotFoundException(`Rent record not found`);
    }
  }

  async create(createRentDto: CreateRentDto): Promise<Rent> {
    return this.dataSource.transaction(async (manager) => {
      const { userId, scooterId } = createRentDto;

      const user = await manager.findOne(User, { where: { id: userId } });
      const scooter = await manager.findOne(Scooter, {
        where: { id: scooterId },
      });

      await this.checkUser(user); // 檢查用戶認證狀態
      await this.checkScooter(scooter); // 檢查車輛是否可用

      // 檢查用戶是否已經歸還車輛
      if (!(await this.checkIsReturn(user, manager))) {
        throw new BadRequestException("User already has an active rent");
      }

      // 創建新的租借記錄
      const newRent = new Rent();
      newRent.userId = user;
      newRent.scooterId = scooter;

      // 更新車輛狀態
      scooter.status = ScooterStatus.INUSE;
      await manager.save(scooter);
      return await manager.save(newRent);
    });
  }

  async return(updateRentDto: UpdateRentDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const { userId, scooterId } = updateRentDto;

      const rent = await manager.findOne(Rent, {
        where: {
          userId: { id: userId },
          scooterId: { id: scooterId },
          endTime: null,
        },
        relations: ["scooterId"],
        order: { startTime: "DESC" },
      });

      await this.checkRent(rent);

      await manager.update(Scooter, scooterId, {
        status: ScooterStatus.AVAILABLE,
      });

      rent.endTime = new Date();
      await manager.save(rent);
    });
  }
}
