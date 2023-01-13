import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupDetailsDto {
  @IsString()
  @IsOptional()
  title?: string;
}
