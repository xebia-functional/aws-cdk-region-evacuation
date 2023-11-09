import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getResponse(textResponse: string): string {
    return textResponse;
  }
}
