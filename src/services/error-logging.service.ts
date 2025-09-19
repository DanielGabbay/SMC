import { Injectable, signal } from '@angular/core';

export interface AppError {
  message: string;
  stack?: string;
  timestamp: Date;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorLoggingService {
  maxErrors = signal(10);
  errors = signal<AppError[]>([]);

  logError(error: any) {
    const newError: AppError = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date(),
      name: error.name || 'Error',
    };

    this.errors.update(currentErrors => {
      const updatedErrors = [newError, ...currentErrors];
      if (updatedErrors.length > this.maxErrors()) {
        return updatedErrors.slice(0, this.maxErrors());
      }
      return updatedErrors;
    });
    
    // Also log to console to not lose default behavior
    console.error("Caught by global error handler:", error);
  }

  clearErrors() {
    this.errors.set([]);
  }

  setMaxErrors(count: number) {
    if (count > 0) {
      this.maxErrors.set(count);
      // Trim if current list is now too long
      this.errors.update(currentErrors => {
        if (currentErrors.length > count) {
          return currentErrors.slice(0, count);
        }
        return currentErrors;
      });
    }
  }
}
