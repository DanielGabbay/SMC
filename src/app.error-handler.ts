import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorLoggingService } from './services/error-logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorLoggingService = inject(ErrorLoggingService);

  handleError(error: any): void {
    this.errorLoggingService.logError(error);
  }
}
