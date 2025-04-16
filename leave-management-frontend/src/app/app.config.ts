import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export function tokenGetter() {
  return localStorage.getItem(environment.tokenKey);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),

    // Use provideHttpClient with withInterceptorsFromDi to support class-based interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // Add HTTP interceptors (order matters: AuthInterceptor first, then ErrorInterceptor)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    // Explicitly provide JwtHelperService to ensure it's available
    {
      provide: JwtHelperService,
      useFactory: () => new JwtHelperService()
    },

    provideAnimations(),
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    }),

    // Import JwtModule for token handling
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [environment.apiUrl.replace('http://', '').replace('https://', '').split('/')[0]],
          disallowedRoutes: [`${environment.apiUrl}/auth/login`, `${environment.apiUrl}/auth/register`]
        }
      })
    )
  ]
};
