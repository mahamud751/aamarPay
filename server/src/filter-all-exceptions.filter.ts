import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const errorResponse = exception.getResponse();
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        // Handle validation errors with detailed information
        if ('errors' in errorResponse) {
          message = (errorResponse as any).message || 'Validation failed';
          errors = (errorResponse as any).errors;
        } else if ('message' in errorResponse) {
          const msg = (errorResponse as any).message;
          if (Array.isArray(msg)) {
            message = msg[0];
          } else {
            message = msg;
          }
        } else {
          message = JSON.stringify(errorResponse);
        }
      }
    } else {
      console.error('Unhandled exception:', exception);
    }

    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (errors) {
      responseBody.errors = errors;
    }

    response.status(status).json(responseBody);
  }
}
