import { Test, TestingModule } from "@nestjs/testing";
import { RentService } from "./rent.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rent } from "../rent/entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter, ScooterStatus } from "../scooter/entities/scooter.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("RentController", () => {
  let service: RentService;
  let rentRepository: Repository<Rent>;
  let userRepository: Repository<User>;
  let scooterRepository: Repository<Scooter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentService,
        {
          provide: getRepositoryToken(Rent),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Scooter),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RentService>(RentService);
    rentRepository = module.get<Repository<Rent>>(getRepositoryToken(Rent));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    scooterRepository = module.get<Repository<Scooter>>(
      getRepositoryToken(Scooter)
    );
  });

  describe("create", () => {
    it("should successfully create a new rent", async () => {
      const user = { id: 1, isCertified: true } as User;
      const scooter = { id: 1, status: ScooterStatus.AVAILABLE } as Scooter;
      const newRent = { userId: user, scooterId: scooter } as Rent;

      jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
      jest.spyOn(scooterRepository, "findOne").mockResolvedValue(scooter);
      jest.spyOn(service, "checkIsReturn").mockResolvedValue(true);
      jest.spyOn(scooterRepository, "save").mockResolvedValue(scooter);
      jest.spyOn(rentRepository, "save").mockResolvedValue(newRent);

      const result = await service.create({ userId: 1, scooterId: 1 });

      // Assert
      expect(result).toEqual(newRent);
      expect(scooterRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ScooterStatus.INUSE })
      );
    });

    it("should throw BadRequestException if user is not certified", async () => {
      // Arrange
      const user = { id: 1, isCertified: false } as User;
      const scooter = { id: 1, status: ScooterStatus.AVAILABLE } as Scooter;
      jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
      jest.spyOn(scooterRepository, "findOne").mockResolvedValue(scooter);

      // Act & Assert
      await expect(service.create({ userId: 1, scooterId: 1 })).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException if scooter is not available", async () => {
      // Arrange
      const user = { id: 1, isCertified: true } as User;
      const scooter = { id: 1, status: ScooterStatus.INUSE } as Scooter;
      jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
      jest.spyOn(scooterRepository, "findOne").mockResolvedValue(scooter);

      // Act & Assert
      await expect(service.create({ userId: 1, scooterId: 1 })).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException if user has an active rent", async () => {
      // Arrange
      const user = { id: 1, isCertified: true } as User;
      const scooter = { id: 1, status: ScooterStatus.AVAILABLE } as Scooter;
      jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
      jest.spyOn(scooterRepository, "findOne").mockResolvedValue(scooter);
      jest.spyOn(service, "checkIsReturn").mockResolvedValue(false);

      // Act & Assert
      await expect(service.create({ userId: 1, scooterId: 1 })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("return", () => {
    it("should successfully return a scooter", async () => {
      // Arrange
      const rent = { id: 1, userId: { id: 1 }, scooterId: { id: 1 } } as Rent;
      jest.spyOn(rentRepository, "findOne").mockResolvedValue(rent);
      jest.spyOn(scooterRepository, "update").mockResolvedValue(undefined);
      const saveSpy = jest
        .spyOn(rentRepository, "save")
        .mockResolvedValue(rent);

      // Act
      await service.return({ userId: 1, scooterId: 1 });

      // Assert
      expect(scooterRepository.update).toHaveBeenCalledWith(1, {
        status: ScooterStatus.AVAILABLE,
      });
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ endTime: expect.any(Date) })
      );
    });

    it("should throw NotFoundException if rent record is not found", async () => {
      // Arrange
      jest.spyOn(rentRepository, "findOne").mockResolvedValue(null);

      // Act & Assert
      await expect(service.return({ userId: 1, scooterId: 1 })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
