import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Review } from './review.entity';
import { Interest } from './interest.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Profile, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Review, (review) => review.user, { cascade: true })
  reviews: Review[];

  @ManyToMany(() => Interest, { cascade: true })
  @JoinTable()
  interests: Interest[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
