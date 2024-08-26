import { Test, TestingModule } from "@nestjs/testing";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Rent } from "./entities/rent.entity";
import { User } from "../user/entities/user.entity";
import { Scooter } from "../scooter/entities/scooter.entity";

const mockRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
});

describe("RentController", () => {
  let controller: RentController;
  let service: RentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [
        RentService,
        {
          provide: getRepositoryToken(Rent),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Scooter),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<RentController>(RentController);
    service = module.get<RentService>(RentService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
