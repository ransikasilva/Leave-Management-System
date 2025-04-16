import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastr = inject(ToastrService);

    if (!authService.isLoggedIn) {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const hasRole = allowedRoles.some(role => authService.hasRole(role));

    if (!hasRole) {
      toastr.error('You do not have permission to access this page', 'Access Denied');
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};
