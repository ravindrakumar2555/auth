import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): { message: string } {
    return {
      message: 'Auth API is running',
    };
  }
}
