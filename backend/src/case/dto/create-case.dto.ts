// src\case\dto\create-case.dto.ts
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CaseStatus } from '@prisma/client';

export class CreateCaseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isClose: boolean;

  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;
}
