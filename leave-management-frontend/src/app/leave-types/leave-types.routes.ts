import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { LeaveTypeListComponent } from './leave-type-list/leave-type-list.component';
import { LeaveTypeFormComponent } from './leave-type-form/leave-type-form.component';

export const LEAVE_TYPES_ROUTES: Routes = [
  {
    path: '',
    component: LeaveTypeListComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Leave Types - Leave Management System'
  },
  {
    path: 'create',
    component: LeaveTypeFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Create Leave Type - Leave Management System'
  },
  {
    path: ':id/edit',
    component: LeaveTypeFormComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR'])],
    title: 'Edit Leave Type - Leave Management System'
  }
];
