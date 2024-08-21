import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Rent } from "src/rent/entities/rent.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @OneToMany(() => Rent, (rent) => rent.userId)
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ default: true })
  isCertified: boolean;
}
