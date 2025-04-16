import { Routes } from '@angular/router';
import { LeaveRequestListComponent } from './leave-request-list/leave-request-list.component';
import { LeaveRequestFormComponent } from './leave-request-form/leave-request-form.component';
import { LeaveDetailComponent } from './leave-detail/leave-detail.component';
import { LeaveApprovalComponent } from './leave-approval/leave-approval.component';
import { LeaveBalanceComponent } from './leave-balance/leave-balance.component';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const LEAVES_ROUTES: Routes = [
  {
    path: 'my-leaves',
    component: LeaveRequestListComponent,
    canActivate: [authGuard],
    title: 'My Leaves - Leave Management System'
  },
  {
    path: 'apply',
    component: LeaveRequestFormComponent,
    canActivate: [authGuard],
    title: 'Apply for Leave - Leave Management System'
  },
  {
    path: ':id',
    component: LeaveDetailComponent,
    canActivate: [authGuard],
    title: 'Leave Details - Leave Management System'
  },
  {
    path: 'approvals',
    component: LeaveApprovalComponent,
    canActivate: [authGuard, () => roleGuard(['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'])],
    title: 'Leave Approvals - Leave Management System'
  },
  {
    path: 'balance',
    component: LeaveBalanceComponent,
    canActivate: [authGuard],
    title: 'Leave Balance - Leave Management System'
  },
  { path: '', redirectTo: 'my-leaves', pathMatch: 'full' }
];
