import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const routine = exception.stack;

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const response = (exception as HttpException).getResponse();
    if (response === 'User not found') {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    const log = {
      timestamp: new Date(),
      url: req.url,
      response,
      routine,
    };
    this.logger.log(log);

    return res.status((exception as HttpException).getStatus()).json(response);
  }
}
