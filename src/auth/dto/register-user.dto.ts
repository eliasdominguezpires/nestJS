import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6) @MaxLength(200)
    password: string;

}