import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { StatsWidgetComponent } from '../stats-widget/stats-widget.component';
import { LeaveCalendarComponent } from '../leave-calendar/leave-calendar.component';
import { TeamAvailabilityComponent } from '../team-availability/team-availability.component';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveBalanceService } from '../../core/services/leave-balance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';

import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    StatsWidgetComponent,
    LeaveCalendarComponent,
    TeamAvailabilityComponent,

    DateFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  pendingLeaves: any[] = [];
  upcomingLeaves: any[] = [];
  recentLeaves: any[] = [];
  leaveBalances: any[] = [];
  loadingPendingLeaves = true;
  loadingUpcomingLeaves = true;
  loadingRecentLeaves = true;
  loadingLeaveBalances = true;
  isManager = false;
  isAdmin = false;
  isHR = false;
  employeeId: string = '';
  stats = {
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingApprovals: 0
  };

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private leaveBalanceService: LeaveBalanceService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) {
    this.isManager = this.authService.hasRole('ROLE_MANAGER');
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');
  }

  ngOnInit(): void {
    this.loadEmployeeId();
    this.notificationService.refreshUnreadCount();
  }

  private loadEmployeeId(): void {
    if (this.authService.currentUserValue?.id) {
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.employeeId = employee.id!;
          this.loadDashboardData();
        },
        error: () => {
          // Handle case when user doesn't have employee record
          this.loadingPendingLeaves = false;
          this.loadingUpcomingLeaves = false;
          this.loadingRecentLeaves = false;
          this.loadingLeaveBalances = false;
        }
      });
    }
  }

  private loadDashboardData(): void {
    this.loadPendingLeaves();
    this.loadUpcomingLeaves();
    this.loadRecentLeaves();
    this.loadLeaveBalances();
    this.loadStats();
  }

  private loadPendingLeaves(): void {
    this.loadingPendingLeaves = true;
    this.leaveService.getLeaveRequestsByEmployeeAndStatus(this.employeeId, 'PENDING').subscribe({
      next: (leaves) => {
        this.pendingLeaves = leaves.slice(0, 5); // Show only the first 5
        this.loadingPendingLeaves = false;
      },
      error: () => {
        this.loadingPendingLeaves = false;
      }
    });
  }

  private loadUpcomingLeaves(): void {
    this.loadingUpcomingLeaves = true;
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    this.leaveService.getEmployeeLeaveRequestsInDateRange(
      this.employeeId,
      today,
      threeMonthsLater
    ).subscribe({
      next: (leaves) => {
        this.upcomingLeaves = leaves
          .filter(leave => leave.status === 'APPROVED')
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5);
        this.loadingUpcomingLeaves = false;
      },
      error: () => {
        this.loadingUpcomingLeaves = false;
      }
    });
  }

  private loadRecentLeaves(): void {
    this.loadingRecentLeaves = true;
    this.leaveService.getLeaveRequestsByEmployee(this.employeeId).subscribe({
      next: (leaves) => {
        this.recentLeaves = leaves
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 5);
        this.loadingRecentLeaves = false;
      },
      error: () => {
        this.loadingRecentLeaves = false;
      }
    });
  }

  private loadLeaveBalances(): void {
    this.loadingLeaveBalances = true;
    this.leaveBalanceService.getEmployeeLeaveBalancesByYear(this.employeeId, new Date().getFullYear()).subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
        this.loadingLeaveBalances = false;
      },
      error: () => {
        this.loadingLeaveBalances = false;
      }
    });
  }

  private loadStats(): void {
    // Get pending leaves count
    this.leaveService.getLeaveRequestsByEmployeeAndStatus(this.employeeId, 'PENDING').subscribe(leaves => {
      this.stats.pendingCount = leaves.length;
    });

    // Get approved leaves count
    this.leaveService.getLeaveRequestsByEmployeeAndStatus(this.employeeId, 'APPROVED').subscribe(leaves => {
      this.stats.approvedCount = leaves.length;
    });

    // Get rejected leaves count
    this.leaveService.getLeaveRequestsByEmployeeAndStatus(this.employeeId, 'REJECTED').subscribe(leaves => {
      this.stats.rejectedCount = leaves.length;
    });

    // Get pending approvals count (for managers, admins, HR)
    if (this.isManager || this.isAdmin || this.isHR) {
      this.leaveService.getLeaveRequestsByApproverAndStatus(this.employeeId, 'PENDING').subscribe(leaves => {
        this.stats.pendingApprovals = leaves.length;
      });
    }
  }
}
