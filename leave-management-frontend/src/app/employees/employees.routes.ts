import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    component: EmployeeListComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'])],
    title: 'Employees - Leave Management System'
  },
  {
    path: 'create',
    component: EmployeeFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Create Employee - Leave Management System'
  },
  {
    path: ':id',
    component: EmployeeDetailComponent,
    canActivate: [authGuard],
    title: 'Employee Details - Leave Management System'
  },
  {
    path: ':id/edit',
    component: EmployeeFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Edit Employee - Leave Management System'
  }
];
