import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, catchError, finalize, of, switchMap } from 'rxjs';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequest } from '../../core/models/leave-request.model';
import { LeaveType } from '../../core/models/leave-type.model';
import { Employee } from '../../core/models/employee.model';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    DateFormatPipe,
  ],
  templateUrl: './leave-detail.component.html',
  styleUrls: ['./leave-detail.component.scss']
})
export class LeaveDetailComponent implements OnInit {
  leaveRequest: LeaveRequest | null = null;
  leaveType: LeaveType | null = null;
  employee: Employee | null = null;
  approver: Employee | null = null;
  loading = true;
  loadingAction = false;
  canCancel = false;
  canApprove = false;
  canReject = false;
  isCurrentUserApprover = false;
  currentEmployeeId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaveService: LeaveService,
    private leaveTypeService: LeaveTypeService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getEmployeeId();
  }

  getEmployeeId(): void {
    if (this.authService.currentUserValue?.id) {
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.currentEmployeeId = employee.id!;
          this.loadLeaveRequest();
        },
        error: (error) => {
          console.error('Error getting employee ID:', error);
          this.loading = false;
          this.showError('Failed to load employee details');
        }
      });
    }
  }

  loadLeaveRequest(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/leaves/my-leaves']);
      return;
    }

    this.loading = true;

    this.leaveService.getLeaveRequestById(id).pipe(
      catchError(error => {
        console.error('Error loading leave request:', error);
        this.showError('Failed to load leave request details');
        this.loading = false;
        return of(null);
      }),
      switchMap(leaveRequest => {
        if (!leaveRequest) {
          return of({
            leaveRequest: null,
            leaveType: null,
            employee: null,
            approver: null
          });
        }

        this.leaveRequest = leaveRequest;

        return forkJoin({
          leaveType: this.leaveTypeService.getLeaveTypeById(leaveRequest.leaveTypeId),
          employee: this.employeeService.getEmployeeById(leaveRequest.employeeId),
          approver: leaveRequest.approverId
            ? this.employeeService.getEmployeeById(leaveRequest.approverId).pipe(
              catchError(() => of(null))
            )
            : of(null)
        }).pipe(
          catchError(error => {
            console.error('Error loading related data:', error);
            return of({
              leaveType: null,
              employee: null,
              approver: null
            });
          })
        );
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(result => {
      if (result) {
        this.leaveType = result.leaveType;
        this.employee = result.employee;
        this.approver = result.approver;

        this.setPermissions();
      }
    });
  }

  setPermissions(): void {
    if (!this.leaveRequest || !this.currentEmployeeId) return;

    const isAdmin = this.authService.hasRole('ROLE_ADMIN');
    const isHR = this.authService.hasRole('ROLE_HR');

    this.isCurrentUserApprover = this.leaveRequest.approverId === this.currentEmployeeId;

    const isOwner = this.leaveRequest.employeeId === this.currentEmployeeId;
    const isPending = this.leaveRequest.status === 'PENDING';
    const isApproved = this.leaveRequest.status === 'APPROVED';

    this.canCancel = isOwner && (isPending || isApproved);
    this.canApprove = (this.isCurrentUserApprover || isAdmin || isHR) && isPending;
    this.canReject = (this.isCurrentUserApprover || isAdmin || isHR) && isPending;
  }

  cancelLeave(): void {
    if (!this.leaveRequest) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Leave Request',
        message: 'Are you sure you want to cancel this leave request?',
        confirmText: 'Cancel Leave',
        cancelText: 'Keep Request',
        inputLabel: 'Reason for cancellation',
        requireInput: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed && result.input) {
        this.performAction(() => {
          return this.leaveService.cancelLeaveRequest(this.leaveRequest!.id!, result.input);
        }, 'Leave request cancelled successfully');
      }
    });
  }

  approveLeave(): void {
    if (!this.leaveRequest) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Leave Request',
        message: 'Are you sure you want to approve this leave request?',
        confirmText: 'Approve',
        cancelText: 'Cancel',
        inputLabel: 'Comments (optional)',
        requireInput: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.performAction(() => {
          return this.leaveService.approveLeaveRequest(
            this.leaveRequest!.id!,
            this.currentEmployeeId,
            result.input || ''
          );
        }, 'Leave request approved successfully');
      }
    });
  }

  rejectLeave(): void {
    if (!this.leaveRequest) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Leave Request',
        message: 'Are you sure you want to reject this leave request?',
        confirmText: 'Reject',
        cancelText: 'Cancel',
        inputLabel: 'Reason for rejection',
        requireInput: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed && result.input) {
        this.performAction(() => {
          return this.leaveService.rejectLeaveRequest(
            this.leaveRequest!.id!,
            this.currentEmployeeId,
            result.input
          );
        }, 'Leave request rejected successfully');
      }
    });
  }

  performAction(action: () => any, successMessage: string): void {
    this.loadingAction = true;

    action().pipe(
      finalize(() => {
        this.loadingAction = false;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open(successMessage, 'Close', {
          duration: 3000
        });
        this.loadLeaveRequest();
      },
      error: (error: { error: { message: any; }; }) => {
        console.error('Error performing action:', error);
        this.showError(error.error?.message || 'Failed to perform action. Please try again.');
      }
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  formatDateRange(start: Date | undefined, end: Date | undefined): string {
    if (!start || !end) {
      return 'Invalid date range';
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() === endDate.getTime()) {
      return new DateFormatPipe().transform(startDate, 'MMM d, yyyy') || '';
    }

    return `${new DateFormatPipe().transform(startDate, 'MMM d')} - ${new DateFormatPipe().transform(endDate, 'MMM d, yyyy')}`;
  }
}
