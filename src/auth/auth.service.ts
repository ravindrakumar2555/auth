import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, StoredUser>();

  constructor(private readonly jwtService: JwtService) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const email = signupDto.email.toLowerCase();

    if (this.users.has(email)) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 10);
    const user: StoredUser = {
      id: randomUUID(),
      name: signupDto.name.trim(),
      email,
      passwordHash,
    };

    this.users.set(email, user);

    return this.buildAuthResponse(user);
  }

  async signin(signinDto: SigninDto): Promise<AuthResponse> {
    const email = signinDto.email.toLowerCase();
    const user = this.users.get(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: StoredUser): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
