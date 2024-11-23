import { CreateReviewDto } from './create-review.dto';

export class UpdateUserDto {
  isActive: boolean;
  firstName: string;
  lastName: string;
  reviews: CreateReviewDto[];
}
