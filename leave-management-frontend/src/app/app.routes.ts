import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthDebugComponent } from './debug/auth-debug.component'; // Import the debug component

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(mod => mod.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(mod => mod.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'departments',
    loadChildren: () => import('./departments/departments.routes').then(mod => mod.DEPARTMENTS_ROUTES),
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'])]
  },
  {
    path: 'employees',
    loadChildren: () => import('./employees/employees.routes').then(mod => mod.EMPLOYEES_ROUTES),
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'])]
  },
  {
    path: 'leave-types',
    loadChildren: () => import('./leave-types/leave-types.routes').then(mod => mod.LEAVE_TYPES_ROUTES),
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])]
  },
  {
    path: 'leaves',
    loadChildren: () => import('./leaves/leaves.routes').then(mod => mod.LEAVES_ROUTES),
    canActivate: [authGuard]
  },
  // Add the debug route
  {
    path: 'auth-debug',
    component: AuthDebugComponent,
    // No auth guard so we can access even if auth is broken
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
