import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequest } from '../../core/models/leave-request.model';
import { LeaveType } from '../../core/models/leave-type.model';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { forkJoin, finalize } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    DateFormatPipe
  ],
  templateUrl: './leave-request-list.component.html',
  styleUrls: ['./leave-request-list.component.scss']
})
export class LeaveRequestListComponent implements OnInit {
  displayedColumns: string[] = ['startDate', 'endDate', 'leaveType', 'duration', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  leaveTypes: LeaveType[] = [];
  leaveStatuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];
  leaveTypeFilter = '';
  statusFilter = 'ALL';
  loading = true;
  employeeId = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private leaveService: LeaveService,
    private leaveTypeService: LeaveTypeService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployeeId();
  }

  private loadEmployeeId(): void {
    if (this.authService.currentUserValue?.id) {
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.employeeId = employee.id!;
          this.loadData();
        },
        error: (error) => {
          console.error('Error loading employee details:', error);
          this.snackBar.open('Failed to load employee details', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private loadData(): void {
    this.loading = true;

    forkJoin({
      leaveTypes: this.leaveTypeService.getAllLeaveTypes(),
      leaves: this.leaveService.getLeaveRequestsByEmployee(this.employeeId)
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (result) => {
        this.leaveTypes = result.leaveTypes;

        // Map leave types to leave requests
        const leavesWithType = result.leaves.map(leave => {
          const leaveType = this.leaveTypes.find(type => type.id === leave.leaveTypeId);
          return {
            ...leave,
            leaveTypeName: leaveType?.name || 'Unknown',
            startDateObj: new Date(leave.startDate),
            endDateObj: new Date(leave.endDate),
          };
        });

        this.dataSource.data = leavesWithType;
        this.applyFilters();

        // Initialize the sort and paginator after data is loaded
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Failed to load leave requests', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Parse the filter string to get both filters
      const filterValues = JSON.parse(filter);

      // Check if the leave type matches (or if no filter is selected)
      const leaveTypeMatch = !filterValues.leaveType || data.leaveTypeId === filterValues.leaveType;

      // Check if the status matches (or if 'ALL' is selected)
      const statusMatch = filterValues.status === 'ALL' || data.status === filterValues.status;

      // Both conditions must be true
      return leaveTypeMatch && statusMatch;
    };

    // Create a JSON string with both filters
    const filterValue = JSON.stringify({
      leaveType: this.leaveTypeFilter,
      status: this.statusFilter
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.leaveTypeFilter = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  cancelLeave(leave: LeaveRequest): void {
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
        this.leaveService.cancelLeaveRequest(leave.id!, result.input).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Leave request cancelled successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Error cancelling leave request:', error);
            this.snackBar.open(error.error?.message || 'Failed to cancel leave request', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  getStatusChipClass(status: string): string {
    return status.toLowerCase();
  }

  canCancelLeave(leave: LeaveRequest): boolean {
    // Only allow cancellation of pending or approved leaves
    return leave.status === 'PENDING' || leave.status === 'APPROVED';
  }
}
