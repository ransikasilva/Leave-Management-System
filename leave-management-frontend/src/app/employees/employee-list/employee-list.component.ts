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
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee } from '../../core/models/employee.model';
import { Department } from '../../core/models/department.model';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-employee-list',
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
    MatChipsModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'department', 'designation', 'joiningDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  searchText = '';
  departmentFilter = '';
  statusFilter = 'ALL';
  departments: Department[] = [];
  isAdmin = false;
  isHR = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');

    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;

    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        const departmentIds = [...new Set(employees
          .filter(emp => emp.departmentId)
          .map(emp => emp.departmentId!))];

        if (departmentIds.length > 0) {
          const departmentRequests = departmentIds.map(id =>
            this.departmentService.getDepartmentById(id)
          );

          this.departmentService.getAllDepartments().pipe(
            finalize(() => {
              this.loading = false;
            })
          ).subscribe({
            next: (departments) => {
              const deptMap = new Map<string, string>();
              departments.forEach(dept => {
                if (dept.id) {
                  deptMap.set(dept.id, dept.name);
                }
              });

              const employeesWithDetails = employees.map(employee => ({
                ...employee,
                departmentName: employee.departmentId ? deptMap.get(employee.departmentId) || 'Unknown' : 'Not Assigned'
              }));

              this.dataSource.data = employeesWithDetails;

              setTimeout(() => {
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.setupSearchFilter();
              });
            },
            error: (error) => {
              console.error('Error loading department details:', error);
              this.loading = false;

              this.dataSource.data = employees.map(employee => ({
                ...employee,
                departmentName: 'Unknown'
              }));

              setTimeout(() => {
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.setupSearchFilter();
              });
            }
          });
        } else {
          this.dataSource.data = employees.map(employee => ({
            ...employee,
            departmentName: 'Not Assigned'
          }));

          this.loading = false;

          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.setupSearchFilter();
          });
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Failed to load employees', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  setupSearchFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchFilter = JSON.parse(filter);

      const searchTermMatch = !searchFilter.text ||
        data.firstName.toLowerCase().includes(searchFilter.text) ||
        data.lastName.toLowerCase().includes(searchFilter.text) ||
        `${data.firstName} ${data.lastName}`.toLowerCase().includes(searchFilter.text) ||
        data.email.toLowerCase().includes(searchFilter.text) ||
        (data.designation && data.designation.toLowerCase().includes(searchFilter.text)) ||
        false;

      const departmentMatch = !searchFilter.department ||
        data.departmentId === searchFilter.department;

      const statusMatch = searchFilter.status === 'ALL' ||
        (searchFilter.status === 'ACTIVE' && data.active) ||
        (searchFilter.status === 'INACTIVE' && !data.active);

      return searchTermMatch && departmentMatch && statusMatch;
    };
  }

  applyFilter(): void {
    const filterValue = JSON.stringify({
      text: this.searchText.trim().toLowerCase(),
      department: this.departmentFilter,
      status: this.statusFilter
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.searchText = '';
    this.departmentFilter = '';
    this.statusFilter = 'ALL';
    this.applyFilter();
  }

  toggleActiveStatus(employee: Employee): void {
    this.loading = true;

    const action = employee.active ?
      this.employeeService.deactivateEmployee(employee.id!) :
      this.employeeService.activateEmployee(employee.id!);

    action.pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        const message = employee.active ?
          'Employee deactivated successfully' :
          'Employee activated successfully';

        this.snackBar.open(message, 'Close', {
          duration: 3000
        });

        this.loadEmployees();
      },
      error: (error) => {
        console.error('Error updating employee status:', error);
        this.snackBar.open('Failed to update employee status', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        this.employeeService.deleteEmployee(employee.id!).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Employee deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.snackBar.open(
              error.error?.message || 'Failed to delete employee. The employee may have associated leave requests.',
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

  getStatusClass(active: boolean): string {
    return active ? 'active' : 'inactive';
  }
}
