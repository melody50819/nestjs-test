import { Test, TestingModule } from "@nestjs/testing";
import { RentService } from "./rent.service";
import { DataSource } from "typeorm";
import { Rent } from "../rent/entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter, ScooterStatus } from "../scooter/entities/scooter.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("RentService", () => {
  let service: RentService;
  let dataSource: DataSource;

  const mockDataSource = {
    transaction: jest.fn((cb) =>
      cb({
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      })
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RentService>(RentService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe("create", () => {
    it("should successfully create a new rent", async () => {
      const user = { id: 1, isCertified: true } as User;
      const scooter = { id: 1, status: ScooterStatus.AVAILABLE } as Scooter;
      const newRent = { userId: user, scooterId: scooter } as Rent;

      mockDataSource.transaction.mockImplementation(async (cb) => {
        const manager = {
          findOne: jest
            .fn()
            .mockResolvedValueOnce(user)
            .mockResolvedValueOnce(scooter),
          save: jest.fn().mockResolvedValue(newRent),
        };
        return cb(manager);
      });

      jest.spyOn(service, "checkIsReturn").mockResolvedValue(true);

      const result = await service.create({ userId: 1, scooterId: 1 });

      expect(result).toEqual(newRent);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it("should throw BadRequestException if user is not certified", async () => {
      const user = { id: 1, isCertified: false } as User;
      const scooter = { id: 1, status: ScooterStatus.AVAILABLE } as Scooter;

      mockDataSource.transaction.mockImplementation(async (cb) => {
        const manager = {
          findOne: jest
            .fn()
            .mockResolvedValueOnce(user)
            .mockResolvedValueOnce(scooter),
        };
        return cb(manager);
      });

      await expect(service.create({ userId: 1, scooterId: 1 })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("return", () => {
    it("should successfully return a scooter", async () => {
      const rent = { id: 1, userId: { id: 1 }, scooterId: { id: 1 } } as Rent;

      mockDataSource.transaction.mockImplementation(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(rent),
          update: jest.fn(),
          save: jest
            .fn()
            .mockResolvedValue({ ...rent, endTime: expect.any(Date) }),
        };
        return cb(manager);
      });

      await service.return({ userId: 1, scooterId: 1 });

      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it("should throw NotFoundException if rent record is not found", async () => {
      mockDataSource.transaction.mockImplementation(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        return cb(manager);
      });

      await expect(service.return({ userId: 1, scooterId: 1 })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
