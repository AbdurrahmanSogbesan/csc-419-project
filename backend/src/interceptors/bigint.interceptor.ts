import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Handle query parameters
    if (request.query) {
      this.transformRequestValues(request.query);
    }

    // Handle request body if it exists
    if (request.body) {
      this.transformRequestValues(request.body);
    }

    // Handle response data with proper null/undefined checks
    return next.handle().pipe(
      map((data) => {
        // Return early if data is undefined or null
        if (data === undefined || data === null) {
          return data;
        }

        // Process data only if it exists
        return JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          ),
        );
      }),
    );
  }

  private transformRequestValues(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      // Convert string numbers to actual numbers for numeric fields
      if (typeof value === 'string' && /^\d+$/.test(value)) {
        const numValue = Number(value);
        // Only convert if it's a valid number and not too large
        if (!isNaN(numValue) && numValue < Number.MAX_SAFE_INTEGER) {
          obj[key] = numValue;
        }
      }
      // Recursively process nested objects
      else if (value && typeof value === 'object') {
        this.transformRequestValues(value);
      }
    });
  }
}
