import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Interest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  place: string;

  constructor(partial: Partial<Interest>) {
    Object.assign(this, partial);
  }
}
