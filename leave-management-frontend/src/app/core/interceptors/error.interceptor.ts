import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private toastr: ToastrService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('ErrorInterceptor: Processing request:', request.url);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 0) {
            errorMessage = 'Could not connect to the server. Please check your internet connection.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Your session has expired. Please login again.';
            // Don't redirect if already on login page or during authentication
            if (!window.location.href.includes('/auth/login') && !request.url.includes('/auth/')) {
              setTimeout(() => {
                void this.router.navigate(['/auth/login']);
              }, 1000);
            }
          } else if (error.status === 404) {
            errorMessage = 'The requested resource was not found';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to access this resource';
          } else if (error.status === 500) {
            errorMessage = 'Internal server error. Please try again later.';
          }
        }

        // Log the error for debugging
        console.error('ErrorInterceptor: HTTP Error:', error);

        // Skip showing errors for auth endpoints to handle them in the components
        if (!request.url.includes('/auth/')) {
          this.toastr.error(errorMessage, 'Error', {
            timeOut: 5000,
            positionClass: 'toast-bottom-right'
          });
        }

        return throwError(() => error);
      })
    );
  }
}
