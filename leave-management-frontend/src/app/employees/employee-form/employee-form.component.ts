import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee } from '../../core/models/employee.model';
import { Department } from '../../core/models/department.model';
import { User } from '../../core/models/user.model';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  loading = false;
  isEditMode = false;
  employeeId: string | null = null;
  departments: Department[] = [];
  managers: Employee[] = [];
  users: User[] = [];
  availableUsers: User[] = [];
  employee: Employee | null = null;

  employmentTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERN', label: 'Intern' },
    { value: 'TEMPORARY', label: 'Temporary' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMasterData();

    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');

      if (this.employeeId) {
        this.isEditMode = true;
        this.loadEmployee(this.employeeId);
      }
    });
  }

  initializeForm(): void {
    this.employeeForm = this.fb.group({
      userId: [null],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s-]{10,15}$/)]],
      departmentId: [null, Validators.required],
      designation: ['', [Validators.maxLength(100)]],
      managerId: [null],
      joiningDate: [null, Validators.required],
      probationEndDate: [null],
      employmentType: ['FULL_TIME', Validators.required],
      employeeId: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
      active: [true]
    });
  }

  loadMasterData(): void {
    this.loading = true;

    // Load departments and employees first
    forkJoin({
      departments: this.departmentService.getAllDepartments(),
      employees: this.employeeService.getAllEmployees(),
      users: this.userService.getAllUsers()
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.departments = data.departments.filter(dept => dept.active);
        this.managers = data.employees.filter(emp => emp.active);
        this.users = data.users;

        // Filter users to get only those without associated employees
        // except the one being edited
        const assignedUserIds = new Set<string>();

        data.employees.forEach(emp => {
          if (emp.userId && (!this.isEditMode || emp.id !== this.employeeId)) {
            assignedUserIds.add(emp.userId);
          }
        });

        this.availableUsers = data.users.filter(user => !assignedUserIds.has(user.id as string));
      },
      error: (errorData) => {
        console.error('Error loading master data:', errorData);
        this.snackBar.open('Failed to load required data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadEmployee(id: string): void {
    this.loading = true;

    this.employeeService.getEmployeeById(id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (employeeData) => {
        this.employee = employeeData;
        this.populateForm(employeeData);

        // If editing, also get user details if available
        if (employeeData.userId) {
          this.userService.getUserById(employeeData.userId).subscribe({
            next: (userData) => {
              // Add the current user to the available users list if not present
              if (!this.availableUsers.some(u => u.id === userData.id)) {
                this.availableUsers.push(userData);
              }
            }
          });
        }
      },
      error: (errorData) => {
        console.error('Error loading employee:', errorData);
        this.snackBar.open('Failed to load employee details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/employees']);
      }
    });
  }

  populateForm(employee: Employee): void {
    this.employeeForm.patchValue({
      userId: employee.userId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      departmentId: employee.departmentId,
      designation: employee.designation,
      managerId: employee.managerId,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate) : null,
      probationEndDate: employee.probationEndDate ? new Date(employee.probationEndDate) : null,
      employmentType: employee.employmentType || 'FULL_TIME',
      employeeId: employee.employeeId,
      address: employee.address,
      active: employee.active !== undefined ? employee.active : true
    });

    // Disable email field in edit mode as it's usually linked to user account
    if (this.isEditMode && employee.userId) {
      this.employeeForm.get('email')?.disable();
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched(this.employeeForm);
      return;
    }

    this.loading = true;

    const formValue = this.employeeForm.getRawValue();
    const employee: Employee = {
      ...formValue,
      // Format dates for API
      joiningDate: formValue.joiningDate ? new Date(formValue.joiningDate) : undefined,
      probationEndDate: formValue.probationEndDate ? new Date(formValue.probationEndDate) : undefined
    };

    const action = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId!, employee)
      : this.employeeService.createEmployee(employee);

    action.pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        const message = this.isEditMode
          ? 'Employee updated successfully'
          : 'Employee created successfully';

        this.snackBar.open(message, 'Close', {
          duration: 3000
        });

        this.router.navigate(['/employees']);
      },
      error: (errorData) => {
        console.error('Error saving employee:', errorData);
        this.snackBar.open(
          errorData.error?.message || 'Failed to save employee information',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  resetForm(): void {
    if (this.isEditMode && this.employee) {
      this.populateForm(this.employee);
    } else {
      this.employeeForm.reset({
        active: true,
        employmentType: 'FULL_TIME'
      });
    }
  }

  canDeactivate(): boolean {
    return !this.employeeForm.dirty || confirm('You have unsaved changes. Do you really want to leave?');
  }

  getDepartmentName(id: string): string {
    const department = this.departments.find(dept => dept.id === id);
    return department ? department.name : '';
  }

  getManagerName(id: string): string {
    const manager = this.managers.find(emp => emp.id === id);
    return manager ? `${manager.firstName} ${manager.lastName}` : '';
  }
}
