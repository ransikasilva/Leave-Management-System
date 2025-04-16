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
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { finalize, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-department-list',
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
    FormsModule
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'code', 'location', 'head', 'employees', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  departments: Department[] = [];
  employees: Map<string, Employee> = new Map();
  searchText = '';
  isAdmin = false;
  isHR = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;

    this.departmentService.getAllDepartments().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (departments) => {
        this.departments = departments;

        // Get unique employee IDs for department heads
        const headIds = departments
          .filter(dept => dept.headOfDepartmentId)
          .map(dept => dept.headOfDepartmentId!);

        if (headIds.length > 0) {
          // Fetch all department heads
          const headRequests = headIds.map(id =>
            this.employeeService.getEmployeeById(id).pipe(
              finalize(() => {
                this.loading = false;
              })
            )
          );

          forkJoin(headRequests).subscribe(employees => {
            employees.forEach(employee => {
              if (employee) {
                this.employees.set(employee.id!, employee);
              }
            });

            this.prepareTableData();
          });
        } else {
          this.prepareTableData();
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.snackBar.open('Failed to load departments', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  prepareTableData(): void {
    const departmentsWithDetails = this.departments.map(department => {
      const head = department.headOfDepartmentId
        ? this.employees.get(department.headOfDepartmentId)
        : null;

      return {
        ...department,
        headName: head ? `${head.firstName} ${head.lastName}` : 'Not assigned',
        employeeCount: department.employeeIds?.length || 0
      };
    });

    this.dataSource.data = departmentsWithDetails;

    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.setupSearchFilter();
    });
  }

  setupSearchFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchText = filter.trim().toLowerCase();

      return data.name.toLowerCase().includes(searchText) ||
        data.departmentCode?.toLowerCase().includes(searchText) ||
        data.location?.toLowerCase().includes(searchText) ||
        data.headName.toLowerCase().includes(searchText);
    };
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteDepartment(department: Department): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete the department "${department.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.loading = true;

        this.departmentService.deleteDepartment(department.id!).pipe(
          finalize(() => {
            this.loading = false;
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Department deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadDepartments();
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
