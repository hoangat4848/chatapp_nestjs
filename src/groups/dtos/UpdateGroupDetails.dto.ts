import { IsString, Length, MinLength } from 'class-validator';

export class UpdateGroupDetailsDto {
  @IsString()
  @MinLength(4)
  title?: string;
}
