import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Rent } from "../../rent/entities/rent.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ default: true })
  isCertified: boolean;

  @OneToMany(() => Rent, (rent) => rent.userId)
  rents: Rent[];
}
