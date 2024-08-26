import { Test, TestingModule } from "@nestjs/testing";
import { ScooterController } from "./scooter.controller";
import { ScooterService } from "./scooter.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Scooter } from "./entities/scooter.entity";
import { Repository } from "typeorm";

const mockScooterRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

describe("ScooterController", () => {
  let controller: ScooterController;
  let service: ScooterService;
  let repository: Repository<Scooter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScooterController],
      providers: [
        ScooterService,
        {
          provide: getRepositoryToken(Scooter),
          useValue: mockScooterRepository,
        },
      ],
    }).compile();

    controller = module.get<ScooterController>(ScooterController);
    service = module.get<ScooterService>(ScooterService);
    repository = module.get<Repository<Scooter>>(getRepositoryToken(Scooter));
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a scooter", async () => {
      const createScooterDto = {};
      jest
        .spyOn(service, "create")
        .mockResolvedValue({ id: 1, ...createScooterDto } as Scooter);

      expect(await controller.create(createScooterDto)).toEqual({
        id: 1,
        ...createScooterDto,
      });
      expect(service.create).toHaveBeenCalledWith(createScooterDto);
    });
  });
});
