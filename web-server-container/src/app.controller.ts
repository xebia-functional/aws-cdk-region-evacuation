import { Controller, Get, Param, Res, Ip, HttpStatus, OnApplicationBootstrap, Req } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import net from 'net';
import { HttpAdapterHost } from '@nestjs/core';

@Controller()
export class AppController implements OnApplicationBootstrap {
  REGION: string = process.env.REGION!;
  HTTP_STATUS_CODE: number = 200;
  DELAY_SECONDS: number = 0;
  private clients: { ip: string; port: number }[] = [];
  sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  constructor(private readonly appService: AppService, private readonly refHost: HttpAdapterHost<any>) {}

  onApplicationBootstrap() {
    const server = this.refHost.httpAdapter.getHttpServer();
    server.keepAliveTimeout = 0; // 0 = unlimited // 30000 = 30 seconds
    server.maxRequestsPerSocket = 0; // 0 = unlimited // 10 = 10 requests

    server.on('connection', (socket: net.Socket) => {
      const client = { ip: socket.remoteAddress, port: socket.remotePort };
      this.clients.push(client);
      console.log(`Client connected from ${client.ip}:${client.port}. Number of clients: ${this.clients.length}`);

      socket.on('close', () => {
        const index = this.clients.indexOf(client);
        if (index !== -1) {
          this.clients.splice(index, 1);
          console.log(
            `Client disconnected from ${client.ip}:${client.port}. Number of clients: ${this.clients.length}`,
          );
        }
      });
    });
  }

  @Get()
  async getRoot(@Req() req, @Res() res: Response, @Ip() ip) {
    const textResponse =
      'Region: ' +
      this.REGION +
      '. HTTP Response code: ' +
      this.HTTP_STATUS_CODE +
      '. Delay response: ' +
      this.DELAY_SECONDS +
      ' seconds.';

    console.log(textResponse);
    await this.sleep(this.DELAY_SECONDS * 1000);
    res.status(this.HTTP_STATUS_CODE).json({
      MessageResponse: this.appService.getResponse(textResponse),
      SocketRequest: req.socket.remoteAddress + ':' + req.socket.remotePort,
      HeadersRequest: req.headers,
      HeadersResponse: res.getHeaders(),
    });
  }

  @Get('close-connection')
  async getCloseConnection(@Req() req, @Res() res: Response, @Ip() ip) {
    const textResponse =
      'Region: ' +
      this.REGION +
      '. HTTP Response code: ' +
      this.HTTP_STATUS_CODE +
      '. Delay response: ' +
      this.DELAY_SECONDS +
      ' seconds.';

    console.log(textResponse);
    await this.sleep(this.DELAY_SECONDS * 1000);
    res.set('Connection', 'close');
    res.status(this.HTTP_STATUS_CODE).json({
      MessageResponse: this.appService.getResponse(textResponse),
      SocketRequest: req.socket.remoteAddress + ':' + req.socket.remotePort,
      HeadersRequest: req.headers,
      HeadersResponse: res.getHeaders(),
    });
  }

  @Get('/connections')
  getHTTPConnections(@Req() req, @Res() res: Response) {
    const textResponse = 'Region: ' + this.REGION + '.';
    res.json({
      MessageResponse: this.appService.getResponse(textResponse),
      SocketRequest: req.socket.remoteAddress + ':' + req.socket.remotePort,
      Connections: this.clients,
    });
  }

  @Get('/config/http/:code')
  setHTTPCodeResponse(@Param() params): string {
    const textResponse = 'HTTP code response: ' + params.code;
    console.log(textResponse);
    this.HTTP_STATUS_CODE = Number(params.code);
    return this.appService.getResponse(textResponse);
  }

  @Get('/config/delay/:seconds')
  setDelayResponse(@Param() params): string {
    const textResponse = 'Delay response: ' + params.seconds;
    console.log(textResponse);
    this.DELAY_SECONDS = Number(params.seconds);
    return this.appService.getResponse(textResponse);
  }

  @Get('/health')
  getHealth(@Res() res: Response) {
    res.status(HttpStatus.OK).send();
  }
}
