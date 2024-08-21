import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Rent } from "src/rent/entities/rent.entity";

export enum ScooterStatus {
  AVAILABLE = "available",
  INUSE = "inUse",
  MAINTENANCE = "maintenance",
}

@Entity()
export class Scooter {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Rent, (rent) => rent.scooterId)
  id: number;

  @Column({
    type: "enum",
    enum: ScooterStatus,
    default: ScooterStatus.AVAILABLE,
  })
  status: string;
}
