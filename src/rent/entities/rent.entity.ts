import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Scooter } from "src/scooter/entities/scooter.entity";

@Entity()
export class Rent {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  userId: number;

  @Column()
  scooterId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Scooter, (scooter) => scooter.id)
  @JoinColumn({ name: "scooterId" })
  scooter: Scooter;

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
