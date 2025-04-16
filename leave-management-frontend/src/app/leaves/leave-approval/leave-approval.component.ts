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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
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
  selector: 'app-leave-approval',
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
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    DateFormatPipe
  ],
  templateUrl: './leave-approval.component.html',
  styleUrls: ['./leave-approval.component.scss']
})
export class LeaveApprovalComponent implements OnInit {
  displayedColumns: string[] = ['employee', 'startDate', 'endDate', 'leaveType', 'duration', 'status', 'actions'];
  pendingDataSource = new MatTableDataSource<any>([]);
  historyDataSource = new MatTableDataSource<any>([]);

  leaveTypes: LeaveType[] = [];
  employees: Map<string, Employee> = new Map();
  loading = true;
  approverId = '';
  searchText = '';

  @ViewChild('pendingSort') pendingSort!: MatSort;
  @ViewChild('historySort') historySort!: MatSort;
  @ViewChild('pendingPaginator') pendingPaginator!: MatPaginator;
  @ViewChild('historyPaginator') historyPaginator!: MatPaginator;

  constructor(
    private leaveService: LeaveService,
    private leaveTypeService: LeaveTypeService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadApproverInfo();
  }

  private loadApproverInfo(): void {
    if (this.authService.currentUserValue?.id) {
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.approverId = employee.id!;
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
      pendingLeaves: this.leaveService.getLeaveRequestsByApproverAndStatus(this.approverId, 'PENDING'),
      processedLeaves: this.leaveService.getLeaveRequestsByApprover(this.approverId),
      leaveTypes: this.leaveTypeService.getAllLeaveTypes()
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (result) => {
        this.leaveTypes = result.leaveTypes;

        const processedLeaves = result.processedLeaves.filter(leave =>
          leave.status !== 'PENDING'
        );

        const uniqueEmployeeIds = new Set<string>();
        [...result.pendingLeaves, ...processedLeaves].forEach(leave => {
          uniqueEmployeeIds.add(leave.employeeId);
        });

        const employeeRequests = Array.from(uniqueEmployeeIds).map(id =>
          this.employeeService.getEmployeeById(id)
        );

        forkJoin(employeeRequests).subscribe(employees => {
          employees.forEach(employee => {
            if (employee) {
              this.employees.set(employee.id!, employee);
            }
          });

          this.prepareTableData(result.pendingLeaves, result.processedLeaves);
        });
      },
      error: (error) => {
        console.error('Error loading leave data:', error);
        this.snackBar.open('Failed to load leave requests', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private prepareTableData(pendingLeaves: LeaveRequest[], processedLeaves: LeaveRequest[]): void {
    const mapLeaveData = (leave: LeaveRequest) => {
      const employee = this.employees.get(leave.employeeId);
      const leaveType = this.leaveTypes.find(type => type.id === leave.leaveTypeId);

      return {
        ...leave,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        leaveTypeName: leaveType ? leaveType.name : 'Unknown',
        startDateObj: new Date(leave.startDate),
        endDateObj: new Date(leave.endDate)
      };
    };

    const pendingData = pendingLeaves.map(mapLeaveData);
    const historyData = processedLeaves.map(mapLeaveData);

    this.pendingDataSource.data = pendingData;
    this.historyDataSource.data = historyData;

    setTimeout(() => {
      this.pendingDataSource.sort = this.pendingSort;
      this.pendingDataSource.paginator = this.pendingPaginator;

      this.historyDataSource.sort = this.historySort;
      this.historyDataSource.paginator = this.historyPaginator;

      this.setupSearchFilter();
    });
  }

  setupSearchFilter(): void {
    this.pendingDataSource.filterPredicate = this.createFilterPredicate();
    this.historyDataSource.filterPredicate = this.createFilterPredicate();
  }

  createFilterPredicate(): (data: any, filter: string) => boolean {
    return (data: any, filter: string) => {
      const searchText = filter.trim().toLowerCase();

      return data.employeeName.toLowerCase().indexOf(searchText) !== -1 ||
        data.leaveTypeName.toLowerCase().indexOf(searchText) !== -1 ||
        data.reason?.toLowerCase().indexOf(searchText) !== -1 ||
        data.status?.toLowerCase().indexOf(searchText) !== -1;
    };
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();

    this.pendingDataSource.filter = filterValue;
    this.historyDataSource.filter = filterValue;

    if (this.pendingDataSource.paginator) {
      this.pendingDataSource.paginator.firstPage();
    }

    if (this.historyDataSource.paginator) {
      this.historyDataSource.paginator.firstPage();
    }
  }

  approveLeave(leave: LeaveRequest): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Leave Request',
        message: `Are you sure you want to approve the leave request for ${this.employees.get(leave.employeeId)?.firstName} ${this.employees.get(leave.employeeId)?.lastName}?`,
        confirmText: 'Approve',
        cancelText: 'Cancel',
        inputLabel: 'Comments (optional)',
        requireInput: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        this.leaveService.approveLeaveRequest(leave.id!, this.approverId, result.input || '').pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Leave request approved successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Error approving leave request:', error);
            this.snackBar.open(error.error?.message || 'Failed to approve leave request', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  rejectLeave(leave: LeaveRequest): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Leave Request',
        message: `Are you sure you want to reject the leave request for ${this.employees.get(leave.employeeId)?.firstName} ${this.employees.get(leave.employeeId)?.lastName}?`,
        confirmText: 'Reject',
        cancelText: 'Cancel',
        inputLabel: 'Reason for rejection',
        requireInput: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed && result.input) {
        this.loading = true;

        this.leaveService.rejectLeaveRequest(leave.id!, this.approverId, result.input).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Leave request rejected successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error: (error) => {
            console.error('Error rejecting leave request:', error);
            this.snackBar.open(error.error?.message || 'Failed to reject leave request', 'Close', {
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
}
