import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth endpoints
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      console.log('AuthInterceptor: Skipping auth endpoint:', request.url);
      return next.handle(request);
    }

    // Retrieve the token from localStorage
    const token = localStorage.getItem(environment.tokenKey);

    if (token) {
      console.log('AuthInterceptor: Adding token to request:', request.url);
      console.log('AuthInterceptor: Token (first 20 chars):', token.substring(0, 20) + '...');
      // Clone the request and add the Authorization header
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Ensure the format is "Bearer <token>"
        }
      });

      return next.handle(authReq);
    }

    console.log('AuthInterceptor: No token found for request:', request.url);
    return next.handle(request);
  }
}
