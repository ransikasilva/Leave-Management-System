import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveType } from '../../core/models/leave-type.model';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-leave-type-list',
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
    MatMenuModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatChipsModule,
    FormsModule
  ],
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.scss']
})
export class LeaveTypeListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'defaultDays', 'paidLeave', 'allowHalfDay', 'requiresApproval', 'active', 'actions'];
  dataSource = new MatTableDataSource<LeaveType>([]);
  loading = true;
  searchText = '';
  isAdmin = false;
  isHR = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private leaveTypeService: LeaveTypeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');
    this.loadLeaveTypes();
  }

  loadLeaveTypes(): void {
    this.loading = true;

    this.leaveTypeService.getAllLeaveTypes().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (leaveTypes) => {
        this.dataSource.data = leaveTypes;

        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.setupSearchFilter();
        });
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
        this.snackBar.open('Failed to load leave types', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  setupSearchFilter(): void {
    this.dataSource.filterPredicate = (data: LeaveType, filter: string) => {
      const searchText = filter.trim().toLowerCase();

      return data.name.toLowerCase().includes(searchText) ||
        data.description?.toLowerCase().includes(searchText) || false;
    };
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleActive(leaveType: LeaveType): void {
    this.loading = true;

    const action = leaveType.active ?
      this.leaveTypeService.deactivateLeaveType(leaveType.id!) :
      this.leaveTypeService.activateLeaveType(leaveType.id!);

    action.pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (updatedLeaveType) => {
        const message = updatedLeaveType.active ?
          `${updatedLeaveType.name} activated successfully` :
          `${updatedLeaveType.name} deactivated successfully`;

        this.snackBar.open(message, 'Close', {
          duration: 3000
        });

        this.loadLeaveTypes();
      },
      error: (error) => {
        console.error('Error toggling leave type status:', error);
        this.snackBar.open('Failed to update leave type status', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteLeaveType(leaveType: LeaveType): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Leave Type',
        message: `Are you sure you want to delete the leave type "${leaveType.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        this.leaveTypeService.deleteLeaveType(leaveType.id!).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Leave type deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadLeaveTypes();
          },
          error: (error) => {
            console.error('Error deleting leave type:', error);
            this.snackBar.open(
              error.error?.message || 'Failed to delete leave type. It may be referenced by existing leave requests.',
              'Close',
              {
                duration: 5000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }
}
