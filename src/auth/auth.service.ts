import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateUserDto } from './dto';

import { JwtPayload } from './interfaces/jwt-payload';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {

  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    // const newUser = new this.userModel(createUserDto);
    // return newUser.save();
    try {
      const { password, ...userDta } = createUserDto;

      // encriptar PSWD
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userDta
      }
      );

      //Guardar USER
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();

      return user;
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        // return Promise.reject(error);
        throw new BadRequestException(`${createUserDto.email} ya existe`);
      } else {
        throw new InternalServerErrorException("Error desconocido - " + error.message);
      }
    }
  }


  findAll(): Promise<User[]> {
    console.log("Find All");

    return this.userModel.find();
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
      if (!updatedUser) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      return deletedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }

  async register(data: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.create(data);

    return {
      user: user,
      token: this.getJWT({ id: user._id }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    /**
     * JWT
     * User {}
     * Token -> 
     */
    console.log(loginDto);
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException("Credenciales Invalidas");
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException("Credenciales Invalidas");
    }
    const { password: _, ...resp } = user.toJSON();

    return {
      user: resp,
      token: this.getJWT({ id: user.id }),
    };
  }

  getJWT(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
