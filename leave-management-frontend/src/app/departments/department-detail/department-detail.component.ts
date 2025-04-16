import { Component, OnInit } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, catchError, map } from 'rxjs/operators';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

interface RequestResult {
  head?: Employee | null;
  parent?: Department | null;
  employees?: Employee[];
  children?: (Department | null)[];
}

@Component({
  selector: 'app-department-detail',
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
    MatProgressBarModule
  ],
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss']
})
export class DepartmentDetailComponent implements OnInit {
  department: Department | null = null;
  departmentHead: Employee | null = null;
  parentDepartment: Department | null = null;
  childDepartments: Department[] = [];
  employees: Employee[] = [];
  loading = true;
  departmentId = '';
  isAdmin = false;
  isHR = false;
  displayedColumns: string[] = ['name', 'designation', 'email', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.departmentId = params['id'];
        this.loadDepartment();
      } else {
        this.router.navigate(['/departments']);
      }
    });
  }

  loadDepartment(): void {
    this.loading = true;

    this.departmentService.getDepartmentById(this.departmentId).pipe(
      catchError(error => {
        console.error('Error loading department:', error);
        this.snackBar.open('Failed to load department details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/departments']);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(department => {
      if (!department) return;

      this.department = department;

      // Load related data
      this.loadRelatedData();
    });
  }

  loadRelatedData(): void {
    if (!this.department) return;

    const requests: Record<string, Observable<any>> = {};

    // Fetch department head if exists
    if (this.department.headOfDepartmentId) {
      requests['head'] = this.employeeService.getEmployeeById(this.department.headOfDepartmentId).pipe(
        catchError(() => of(null))
      );
    }

    // Fetch parent department if exists
    if (this.department.parentDepartmentId) {
      requests['parent'] = this.departmentService.getDepartmentById(this.department.parentDepartmentId).pipe(
        catchError(() => of(null))
      );
    }

    // Fetch employees in this department
    if (this.department.id) {
      requests['employees'] = this.employeeService.getEmployeesByDepartment(this.department.id).pipe(
        catchError(() => of([]))
      );
    }

    // Fetch child departments if any
    if (this.department.childDepartmentIds && this.department.childDepartmentIds.length > 0) {
      const childRequests = this.department.childDepartmentIds.map(id =>
        this.departmentService.getDepartmentById(id).pipe(
          catchError(() => of(null))
        )
      );

      if (childRequests.length > 0) {
        requests['children'] = forkJoin(childRequests);
      }
    }

    if (Object.keys(requests).length > 0) {
      this.loading = true;

      forkJoin(requests).pipe(
        finalize(() => {
          this.loading = false;
        })
      ).subscribe((results: Record<string, any>) => {
        if (results['head']) {
          this.departmentHead = results['head'];
        }

        if (results['parent']) {
          this.parentDepartment = results['parent'];
        }

        if (results['employees']) {
          this.employees = results['employees'];
        }

        if (results['children']) {
          this.childDepartments = results['children'].filter(Boolean);
        }
      });
    }
  }

  deleteDepartment(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete the department "${this.department?.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed && this.department?.id) {
        this.loading = true;

        this.departmentService.deleteDepartment(this.department.id).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Department deleted successfully', 'Close', {
              duration: 3000
            });
            this.router.navigate(['/departments']);
          },
          error: (error) => {
            console.error('Error deleting department:', error);
            this.snackBar.open(
              error.error?.message || 'Failed to delete department. It may have associated employees.',
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
