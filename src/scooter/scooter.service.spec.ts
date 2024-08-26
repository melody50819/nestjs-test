import { Test, TestingModule } from "@nestjs/testing";
import { ScooterService } from "./scooter.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Scooter } from "./entities/scooter.entity";

describe("UserService", () => {
  let service: ScooterService;
  let mockUserRepository;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScooterService,
        {
          provide: getRepositoryToken(Scooter),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ScooterService>(ScooterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
