import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sex: string;

  @Column()
  dob: Date;

  @Column()
  tel: string;

  @Column()
  address: string;

  @Column()
  city: string;

  constructor(partial: Partial<Profile>) {
    Object.assign(this, partial);
  }
}
