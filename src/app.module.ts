import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entities/user.entity";
import { Scooter } from "./scooter/entities/scooter.entity";
import { Rent } from "./rent/entities/rent.entity";
import { ScooterModule } from "./scooter/scooter.module";
import { RentModule } from "./rent/rent.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "admin",
      database: "test",
      entities: [User, Scooter, Rent],
      synchronize: true,
    }),
    UserModule,
    ScooterModule,
    RentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
