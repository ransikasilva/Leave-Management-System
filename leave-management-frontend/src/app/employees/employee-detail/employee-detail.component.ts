import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { finalize, catchError, switchMap, tap, take, filter } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee } from '../../core/models/employee.model';
import { Department } from '../../core/models/department.model';
import { User } from '../../core/models/user.model';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  department: Department | null = null;
  manager: Employee | null = null;
  subordinates: Employee[] = [];
  user: User | null = null;
  loading = true;
  employeeId = '';
  isAdmin = false;
  isHR = false;
  isManager = false;
  isSelfProfile = false;
  displayedColumns: string[] = ['name', 'designation', 'email', 'actions'];
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');
    this.isManager = this.authService.hasRole('ROLE_MANAGER');

    // Wait for auth to be ready before loading data
    this.subscriptions.add(
      this.authService.authReady$.pipe(
        filter(ready => ready),
        take(1),
        switchMap(() => this.route.params)
      ).subscribe(params => {
        if (params['id']) {
          this.employeeId = params['id'];
          this.loadEmployee();

          // Check if this is the current user's profile
          const currentUser = this.authService.currentUserValue;
          if (currentUser?.employeeId === this.employeeId) {
            this.isSelfProfile = true;
          }
        } else {
          void this.router.navigate(['/employees']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEmployee(): void {
    this.loading = true;

    this.employeeService.getEmployeeById(this.employeeId).pipe(
      catchError(error => {
        console.error('Error loading employee:', error);
        this.toastr.error('Failed to load employee details', 'Error');
        void this.router.navigate(['/employees']);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(employee => {
      if (!employee) return;

      this.employee = employee;

      // Load related data
      this.loadRelatedData();
    });
  }

  loadRelatedData(): void {
    if (!this.employee) return;

    const requests: Record<string, Observable<any>> = {};

    // Fetch department if exists
    if (this.employee.departmentId) {
      requests['department'] = this.departmentService.getDepartmentById(this.employee.departmentId).pipe(
        catchError(() => of(null))
      );
    }

    // Fetch manager if exists
    if (this.employee.managerId) {
      requests['manager'] = this.employeeService.getEmployeeById(this.employee.managerId).pipe(
        catchError(() => of(null))
      );
    }

    // Fetch subordinates
    if (this.employee.id) {
      requests['subordinates'] = this.employeeService.getEmployeesByManager(this.employee.id).pipe(
        catchError(() => of([]))
      );
    }

    // Fetch user account if exists
    if (this.employee.userId) {
      requests['user'] = this.userService.getUserById(this.employee.userId).pipe(
        catchError(() => of(null))
      );
    }

    if (Object.keys(requests).length > 0) {
      this.loading = true;

      forkJoin(requests).pipe(
        finalize(() => {
          this.loading = false;
        })
      ).subscribe((results: Record<string, any>) => {
        this.department = results['department'] || null;
        this.manager = results['manager'] || null;
        this.subordinates = results['subordinates'] || [];
        this.user = results['user'] || null;
      });
    }
  }

  toggleActiveStatus(): void {
    if (!this.employee || !this.employee.id) return;

    const isActive = this.employee.active === true;
    const action = isActive ? 'deactivate' : 'activate';
    const firstName = this.employee.firstName || 'Unknown';
    const lastName = this.employee.lastName || 'Employee';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
        message: `Are you sure you want to ${action} ${firstName} ${lastName}?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        const request = isActive
          ? this.employeeService.deactivateEmployee(this.employee!.id!)
          : this.employeeService.activateEmployee(this.employee!.id!);

        request.pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: (updatedEmployee) => {
            this.employee = updatedEmployee;
            const statusText = this.employee.active ? 'activated' : 'deactivated';
            this.toastr.success(`Employee ${statusText} successfully`);
          },
          error: (error) => {
            console.error(`Error ${action}ing employee:`, error);
            this.toastr.error(
              error.error?.message || `Failed to ${action} employee`,
              'Error'
            );
          }
        });
      }
    });
  }

  deleteEmployee(): void {
    if (!this.employee || !this.employee.id) return;

    const firstName = this.employee.firstName || 'Unknown';
    const lastName = this.employee.lastName || 'Employee';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${firstName} ${lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        this.employeeService.deleteEmployee(this.employee!.id!).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.toastr.success('Employee deleted successfully');
            void this.router.navigate(['/employees']);
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.toastr.error(
              error.error?.message || 'Failed to delete employee. The employee may have associated leave requests.',
              'Error'
            );
          }
        });
      }
    });
  }

  getFormattedDate(date: Date | string | undefined): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
