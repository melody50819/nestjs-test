import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RentModule } from "../src/rent/rent.module";
import { Rent } from "../src/rent/entities/rent.entity";
import { User } from "../src/user/entities/user.entity";
import { Scooter, ScooterStatus } from "../src/scooter/entities/scooter.entity";
import { CreateRentDto } from "../src/rent/dto/create-rent.dto";
import { UpdateRentDto } from "../src/rent/dto/update-rent.dto";

type MockRepository<T = never> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe("Rent (e2e)", () => {
  let app: INestApplication;
  let rentRepository: MockRepository;
  let userRepository: MockRepository;
  let scooterRepository: MockRepository;

  const mockRentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockScooterRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RentModule],
    })
      .overrideProvider(getRepositoryToken(Rent))
      .useValue(mockRentRepository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Scooter))
      .useValue(mockScooterRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    rentRepository = moduleFixture.get(getRepositoryToken(Rent));
    userRepository = moduleFixture.get(getRepositoryToken(User));
    scooterRepository = moduleFixture.get(getRepositoryToken(Scooter));
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/rent (POST)", () => {
    it("should create a new rent", async () => {
      const createRentDto: CreateRentDto = { userId: 1, scooterId: 1 };
      const mockUser = { id: 1, isCertified: true };
      const mockScooter = { id: 1, status: ScooterStatus.AVAILABLE };
      const mockRent = {
        id: 1,
        ...createRentDto,
        startTime: new Date().toString(),
        endTime: null,
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      scooterRepository.findOne.mockResolvedValue(mockScooter);
      rentRepository.findOne.mockResolvedValue(null); // No active rent
      rentRepository.save.mockResolvedValue(mockRent);
      scooterRepository.save.mockResolvedValue({
        ...mockScooter,
        status: ScooterStatus.INUSE,
      });

      const response = await request(app.getHttpServer())
        .post("/rent")
        .send(createRentDto)
        .expect(201);

      expect(response.body).toEqual(mockRent);
    });

    it("should throw an error if user is not certified", async () => {
      const createRentDto: CreateRentDto = { userId: 2, scooterId: 1 };
      const mockUser = { id: 2, isCertified: false };

      userRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post("/rent")
        .send(createRentDto)
        .expect(400);

      expect(response.body).toMatchObject({
        message: "User is not certified",
        statusCode: 400,
      });
    });
  });

  describe("/rent/return (POST)", () => {
    it("should create a rent and then return it", async () => {
      // 1. create a new rent
      const createRentDto: CreateRentDto = { userId: 1, scooterId: 1 };
      const mockUser = { id: 1, isCertified: true };
      const mockScooter = { id: 1, status: ScooterStatus.AVAILABLE };
      const mockRent = {
        userId: mockUser,
        scooterId: mockScooter,
        startTime: new Date().toString(),
        endTime: null,
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      scooterRepository.findOne.mockResolvedValue(mockScooter);
      rentRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockRent);
      rentRepository.save.mockResolvedValue(mockRent);
      scooterRepository.save.mockResolvedValue({
        ...mockScooter,
        status: ScooterStatus.INUSE,
      });

      const createResponse = await request(app.getHttpServer())
        .post("/rent")
        .send(createRentDto)
        .expect(201);

      expect(createResponse.body).toMatchObject(mockRent);

      // 2. return a rent
      const updateRentDto: UpdateRentDto = { userId: 1, scooterId: 1 };

      rentRepository.findOne.mockResolvedValueOnce({
        ...mockRent,
        userId: { id: 1 },
        scooterId: { id: 1 },
      });
      scooterRepository.update.mockResolvedValue({ affected: 1 });
      rentRepository.save.mockResolvedValue({
        ...mockRent,
        endTime: new Date(),
      });

      await request(app.getHttpServer())
        .patch("/rent/return")
        .send(updateRentDto)
        .expect(200);

      // check method has been called
      expect(rentRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: { id: 1 },
          scooterId: { id: 1 },
          endTime: null,
        },
        relations: ["scooterId"],
        order: { startTime: "DESC" },
      });
      expect(scooterRepository.update).toHaveBeenCalledWith(1, {
        status: ScooterStatus.AVAILABLE,
      });
      expect(rentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          endTime: expect.any(Date),
        })
      );
    });
  });
});
