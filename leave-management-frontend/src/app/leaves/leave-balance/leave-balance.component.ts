import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, finalize } from 'rxjs';
import { LeaveBalanceService } from '../../core/services/leave-balance.service';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveBalance, LeaveBalanceHistory } from '../../core/models/leave-balance.model';
import { LeaveType } from '../../core/models/leave-type.model';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

interface BalanceWithType extends LeaveBalance {
  leaveTypeName: string;
  carryForwardable: boolean;
  percentUsed: number;
  carryForwardedInfo?: any;
}

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    DateFormatPipe
  ],
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  balances: BalanceWithType[] = [];
  leaveTypes: Map<string, LeaveType> = new Map();
  loading = true;
  currentYear = new Date().getFullYear();
  previousYear = this.currentYear - 1;
  employeeId = '';

  historyDisplayedColumns: string[] = ['date', 'action', 'value', 'description'];
  expandedBalance: string | null = null;

  constructor(
    private leaveBalanceService: LeaveBalanceService,
    private leaveTypeService: LeaveTypeService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getEmployeeId();
  }

  getEmployeeId(): void {
    if (this.authService.currentUserValue?.id) {
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.employeeId = employee.id!;
          this.loadData();
        },
        error: (error) => {
          console.error('Error getting employee ID:', error);
          this.loading = false;
        }
      });
    }
  }

  loadData(): void {
    this.loading = true;

    forkJoin({
      leaveTypes: this.leaveTypeService.getAllLeaveTypes(),
      currentYearBalances: this.leaveBalanceService.getEmployeeLeaveBalancesByYear(
        this.employeeId,
        this.currentYear
      ),
      previousYearBalances: this.leaveBalanceService.getEmployeeLeaveBalancesByYear(
        this.employeeId,
        this.previousYear
      )
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (result) => {
        // Store leave types in a map for quick access
        result.leaveTypes.forEach(type => {
          this.leaveTypes.set(type.id!, type);
        });

        // Process current year balances
        this.balances = result.currentYearBalances.map(balance => {
          const leaveType = this.leaveTypes.get(balance.leaveTypeId);

          return {
            ...balance,
            leaveTypeName: leaveType?.name || 'Unknown',
            carryForwardable: leaveType?.carryForward || false,
            percentUsed: balance.totalAllocated > 0
              ? (balance.used / balance.totalAllocated) * 100
              : 0
          };
        });

        // Check for previous year's carry forward if appropriate
        if (result.previousYearBalances.length > 0) {
          this.processPreviousYearCarryForward(result.previousYearBalances);
        }
      },
      error: (error) => {
        console.error('Error loading leave balances:', error);
        this.loading = false;
      }
    });
  }

  processPreviousYearCarryForward(previousYearBalances: LeaveBalance[]): void {
    previousYearBalances.forEach(prevBalance => {
      const leaveType = this.leaveTypes.get(prevBalance.leaveTypeId);

      if (leaveType?.carryForward) {
        const maxCarryDays = leaveType.maxCarryForwardDays || 0;
        const availableThenToCarry = Math.min(prevBalance.available, maxCarryDays);

        if (availableThenToCarry > 0) {
          const currentBalance = this.balances.find(b => b.leaveTypeId === prevBalance.leaveTypeId);

          if (currentBalance) {
            // Add note about potential carry forward
            const info = {
              previousYearBalance: prevBalance.available,
              maxCarryForwardDays: maxCarryDays,
              actualCarryForward: availableThenToCarry
            };

            currentBalance.carryForwardedInfo = info;
          }
        }
      }
    });
  }

  toggleExpand(balanceId: string): void {
    this.expandedBalance = this.expandedBalance === balanceId ? null : balanceId;
  }

  getProgressBarColor(percentUsed: number): string {
    if (percentUsed < 50) {
      return 'primary';
    } else if (percentUsed < 75) {
      return 'accent';
    } else {
      return 'warn';
    }
  }

  getActionText(action: string): string {
    switch (action) {
      case 'ALLOCATION':
        return 'Allocated';
      case 'DEDUCTION':
        return 'Deducted';
      case 'REFUND':
        return 'Refunded';
      case 'ADJUSTMENT':
        return 'Adjusted';
      default:
        return action;
    }
  }
}
