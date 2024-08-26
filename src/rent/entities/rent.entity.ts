import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Scooter } from "../../scooter/entities/scooter.entity";

@Entity()
export class Rent {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => User, (user) => user.rents)
  @JoinColumn({ name: "userId" })
  userId: User;

  @ManyToOne(() => Scooter, (scooter) => scooter.rents)
  @JoinColumn({ name: "scooterId" })
  scooterId: Scooter;

  @Column({ type: "timestamp", default: () => "now()" })
  startTime: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
