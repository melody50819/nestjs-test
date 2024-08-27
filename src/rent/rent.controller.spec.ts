import { Test, TestingModule } from "@nestjs/testing";
import { RentController } from "./rent.controller";
import { RentService } from "./rent.service";
import { DataSource } from "typeorm";

describe("RentController", () => {
  let controller: RentController;
  let service: RentService;

  const mockDataSource = {
    transaction: jest.fn((callback) =>
      callback({
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      })
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [
        RentService,
        {
          provide: DataSource,
          useValue: mockDataSource,
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
