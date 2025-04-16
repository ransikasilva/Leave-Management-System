import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs/operators';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Department } from '../../core/models/department.model';
import { Employee } from '../../core/models/employee.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  departmentId = '';
  loading = false;
  submitting = false;
  employees: Employee[] = [];
  departments: Department[] = [];
  isAdmin = false;
  isHR = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');

    if (!this.isAdmin && !this.isHR) {
      this.router.navigate(['/departments']);
      return;
    }

    this.initializeForm();
    this.loadEmployees();
    this.loadDepartments();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.departmentId = params['id'];
        this.loadDepartment(this.departmentId);
      }
    });
  }

  initializeForm(): void {
    this.departmentForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      departmentCode: [''],
      headOfDepartmentId: [''],
      parentDepartmentId: [''],
      location: [''],
      active: [true]
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getActiveEmployees().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Failed to load employees', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
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

  loadDepartment(id: string): void {
    this.loading = true;
    this.departmentService.getDepartmentById(id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (department) => {
        this.departmentForm.patchValue({
          name: department.name,
          description: department.description,
          departmentCode: department.departmentCode,
          headOfDepartmentId: department.headOfDepartmentId,
          parentDepartmentId: department.parentDepartmentId,
          location: department.location,
          active: department.active
        });
      },
      error: (error) => {
        console.error('Error loading department:', error);
        this.snackBar.open('Failed to load department details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/departments']);
      }
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.departmentForm.controls).forEach(key => {
        const control = this.departmentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const departmentData: Department = {
      ...this.departmentForm.value
    };

    if (this.isEditMode) {
      this.departmentService.updateDepartment(this.departmentId, departmentData).pipe(
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Department updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/departments']);
        },
        error: (error) => {
          console.error('Error updating department:', error);
          this.snackBar.open(error.error?.message || 'Failed to update department', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.departmentService.createDepartment(departmentData).pipe(
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Department created successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/departments']);
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.snackBar.open(error.error?.message || 'Failed to create department', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  filterDepartments(): Department[] {
    // In edit mode, filter out the current department to prevent circular references
    if (this.isEditMode) {
      return this.departments.filter(dept => dept.id !== this.departmentId);
    }
    return this.departments;
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadDepartment(this.departmentId);
    } else {
      this.departmentForm.reset({
        active: true
      });
    }
  }
}
