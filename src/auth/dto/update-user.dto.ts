import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {

    @IsBoolean()
    isActive: boolean;

    @IsString()
    name: string;
}
