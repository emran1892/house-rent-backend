import { Controller, Post, Body,UseGuards,Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse,ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-owner')
  @ApiOperation({ summary: 'New Owner Registration' })
  @ApiResponse({ status: 201, description: 'Owner and Organization created successfully' })
  async registerOwner(@Body() dto: RegisterOwnerDto) {
    return this.authService.registerOwner(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with Phone Number and Password' })
  @ApiResponse({ status: 200, description: 'Login successful and token provided' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }


 @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Login Summary Information' })
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Login successful. Here is your profile information.',
      user,
    };
}
}
 