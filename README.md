# NestJS with TypeORM

Install the packages.

```bash
yarn add @nestjs/config @nestjs/typeorm typeorm pg
```

### TypeORM Database Connection

Create a module for the data source in `database.module.ts`.

```js
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow('POSTGRES_PORT'),
        database: configService.getOrThrow('POSTGRES_DB'),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow('POSTGRES_SYNC'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

Import the database module in `app.module.ts`.

```js
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### TypeORM Resource

Generate a new user resource.

```bash
nest g resource users
```

Define the user schema in `user.entity.ts`.

```js
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
```

Import the user entity in `users.module.ts`.

```js
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### TypeORM Endpoints

Create CRUD endpoints for users in `users.controller.ts`.

```js
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

Define the schema for creating an user in `create-user.dto.ts`.

```js
export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```

Define the schema for updating an user in `update-user.dto.ts`.

```js
export class UpdateUserDto {
  isActive: boolean;
  firstName: string;
  lastName: string;
}
```

### TypeORM Handlers

Create endpoint handlers for users in `users.service.ts`.

```js
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);

    await this.entityManager.save(user);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    user.isActive = updateUserDto.isActive;
    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;

    await this.entityManager.save(user);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }
}
```

### TypeORM One-to-One

Define the profile schema in `profile.entity.ts`.

```js
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
```

Add a new relation in `user.entity.ts` for user profile.

```js
@OneToOne(() => Profile, { cascade: true })
@JoinColumn()
profile: Profile;
```

Define the schema for creating a profile in `create-profile.dto.ts`.

```js
export class CreateProfileDto {
  sex: string;
  dob: Date;
  tel: string;
  address: string;
  city: string;
}
```

Add a new field in `create-user.dto.ts` for user profile.

```js
{
  ...
  profile: CreateProfileDto;
}
```

Update the create user method in `users.service.ts`.

```js
async create(createUserDto: CreateUserDto) {
  const profile = new Profile({
    ...createUserDto.profile,
  });
  const user = new User({
    ...createUserDto,
    profile,
  });

  await this.entityManager.save(user);
}
```

Update the get user method in `users.service.ts`.

```js
async findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
}
```

Add profile entity in `users.module.ts`.

```js
imports: [TypeOrmModule.forFeature([User, Profile])];
```

### TypeORM One-to-Many

Define the review schema in `review.entity.ts`.

```js
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  rating: number;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
```

Add a new relation in `user.entity.ts` for user reviews.

```js
@OneToMany(() => Review, (review) => review.user, { cascade: true })
reviews: Review[];
```

Define the schema for creating reviews in `create-review.dto.ts`.

```js
export class CreateReviewDto {
  content: string;
  rating: number;
}
```

Add a new field in `update-user.dto.ts` for user reviews.

```js
{
  ...
  reviews: CreateReviewDto[];
}
```

Update the create user method in `users.service.ts`.

```js
const user = new User({
  ...createUserDto,
  profile,
  reviews: [],
});
```

Update the get user method in `users.service.ts`.

```js
relations: { profile: true, reviews: true },
```

Update the update user method in `users.service.ts`.

```js
const reviews = updateUserDto.reviews.map(
  (createReviewDto) => new Review(createReviewDto),
);
user.reviews = reviews;
```

Add review entity in `users.module.ts`.

```js
imports: [TypeOrmModule.forFeature([User, Profile, Review])],
```

### TypeORM Many-to-Many

Define the interest schema in `interest.entity.ts`.

```js
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
```

Add a new relation in `user.entity.ts` for user interests.

```js
@ManyToMany(() => Interest, { cascade: true })
@JoinTable()
interests: Interest[];
```

Define the schema for creating interests in `create-interest.dto.ts`.

```js
export class CreateInterestDto {
  place: string;
}
```

Add a new field in `create-user.dto.ts` for user interests.

```js
{
  ...
  interests: CreateInterestDto[];
}
```

Update the create user method in `users.service.ts`.

```js
const interests = createUserDto.interests.map(
  (createInterestDto) => new Interest(createInterestDto),
);
const user = new User({
  ...createUserDto,
  profile,
  reviews: [],
  interests,
});
```

Update the get user method in `users.service.ts`.

```js
relations: { profile: true, reviews: true, interests: true },
```

Add interest entity in `users.module.ts`.

```js
imports: [TypeOrmModule.forFeature([User, Profile, Review, Interest])],
```
