import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const DEPARTMENTS_ROUTES: Routes = [
  {
    path: '',
    component: DepartmentListComponent,
    canActivate: [authGuard],
    title: 'Departments - Leave Management System'
  },
  {
    path: 'create',
    component: DepartmentFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Create Department - Leave Management System'
  },
  {
    path: ':id',
    component: DepartmentDetailComponent,
    canActivate: [authGuard],
    title: 'Department Details - Leave Management System'
  },
  {
    path: ':id/edit',
    component: DepartmentFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Edit Department - Leave Management System'
  }
];
