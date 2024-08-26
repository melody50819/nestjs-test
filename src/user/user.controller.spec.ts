import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createUserDto = { name: "Test" };
      jest
        .spyOn(service, "create")
        .mockResolvedValue({ id: 1, ...createUserDto } as User);

      expect(await controller.create(createUserDto)).toEqual({
        id: 1,
        ...createUserDto,
      });
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
