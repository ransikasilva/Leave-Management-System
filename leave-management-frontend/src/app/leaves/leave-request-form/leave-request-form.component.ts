import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { LeaveBalanceService } from '../../core/services/leave-balance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveType } from '../../core/models/leave-type.model';
import { LeaveBalance } from '../../core/models/leave-balance.model';
import { LeaveRequest } from '../../core/models/leave-request.model';
import { Employee } from '../../core/models/employee.model';
import { finalize, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.scss']
})
export class LeaveRequestFormComponent implements OnInit {
  leaveForm!: FormGroup;
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  managers: Employee[] = [];
  loading = false;
  loadingData = true;
  submitting = false;
  employeeId = '';
  currentDate = new Date();
  minDate = new Date();
  calculatedDuration = 0;
  calculatingDuration = false;

  constructor(
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private leaveTypeService: LeaveTypeService,
    private leaveBalanceService: LeaveBalanceService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Set min date to today
    this.minDate.setHours(0, 0, 0, 0);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadEmployeeData();

    // Subscribe to date changes to recalculate duration
    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    this.leaveForm.get('halfDay')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  }

  private initializeForm(): void {
    this.leaveForm = this.formBuilder.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      halfDay: [false],
      halfDayType: [''],
      approverId: ['', Validators.required],
      contactDetails: [''],
      urgent: [false]
    });

    // Disable half day type if half day is not selected
    this.leaveForm.get('halfDay')?.valueChanges.subscribe(value => {
      const halfDayTypeControl = this.leaveForm.get('halfDayType');
      if (value) {
        halfDayTypeControl?.enable();
        halfDayTypeControl?.setValidators(Validators.required);
      } else {
        halfDayTypeControl?.disable();
        halfDayTypeControl?.clearValidators();
      }
      halfDayTypeControl?.updateValueAndValidity();
    });
  }

  private loadEmployeeData(): void {
    this.loadingData = true;

    if (this.authService.currentUserValue?.id) {
      // Get employee details first
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).pipe(
        switchMap(employee => {
          this.employeeId = employee.id!;

          // Now load all required data in parallel
          return forkJoin({
            leaveTypes: this.leaveTypeService.getActiveLeaveTypes(),
            leaveBalances: this.leaveBalanceService.getEmployeeLeaveBalancesByYear(
              this.employeeId,
              this.currentDate.getFullYear()
            ),
            managers: this.employeeService.getActiveEmployees() // In a real app, you might filter for managers only
          });
        }),
        finalize(() => {
          this.loadingData = false;
        })
      ).subscribe({
        next: (data) => {
          this.leaveTypes = data.leaveTypes;
          this.leaveBalances = data.leaveBalances;
          this.managers = data.managers.filter(manager => manager.id !== this.employeeId); // Exclude self

          // Prefill approver if the employee has a manager assigned
          const employee = this.employeeService.getEmployeeById(this.employeeId).subscribe(employee => {
            if (employee.managerId) {
              this.leaveForm.patchValue({
                approverId: employee.managerId
              });
            }
          });
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.snackBar.open('Failed to load required data. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getLeaveTypeBalance(leaveTypeId: string): number {
    const balance = this.leaveBalances.find(b => b.leaveTypeId === leaveTypeId);
    return balance ? balance.available : 0;
  }

  calculateDuration(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;
    const halfDay = this.leaveForm.get('halfDay')?.value;

    if (startDate && endDate) {
      this.calculatingDuration = true;

      this.leaveService.calculateLeaveDuration(
        startDate,
        endDate,
        halfDay,
        halfDay ? this.leaveForm.get('halfDayType')?.value : undefined
      ).pipe(
        finalize(() => {
          this.calculatingDuration = false;
        })
      ).subscribe({
        next: (duration) => {
          this.calculatedDuration = duration;
        },
        error: (error) => {
          console.error('Error calculating duration:', error);
          this.calculatedDuration = 0;
        }
      });
    } else {
      this.calculatedDuration = 0;
    }
  }

  checkOverlap(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && endDate && this.employeeId) {
      this.loading = true;

      this.leaveService.checkLeaveOverlap(this.employeeId, startDate, endDate).pipe(
        finalize(() => {
          this.loading = false;
        })
      ).subscribe({
        next: (response) => {
          if (!response.success) {
            this.snackBar.open('Warning: You have overlapping leave requests during this period.', 'Close', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          console.error('Error checking overlap:', error);
        }
      });
    }
  }

  checkEligibility(): void {
    const leaveTypeId = this.leaveForm.get('leaveTypeId')?.value;

    if (leaveTypeId && this.calculatedDuration > 0 && this.employeeId) {
      this.loading = true;

      this.leaveService.checkLeaveEligibility(
        this.employeeId,
        leaveTypeId,
        this.calculatedDuration
      ).pipe(
        finalize(() => {
          this.loading = false;
        })
      ).subscribe({
        next: (response) => {
          if (!response.success) {
            this.snackBar.open('Warning: You do not have sufficient leave balance for this request.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Error checking eligibility:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.leaveForm.controls).forEach(key => {
        const control = this.leaveForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const leaveRequest: LeaveRequest = {
      employeeId: this.employeeId,
      leaveTypeId: this.leaveForm.get('leaveTypeId')?.value,
      startDate: this.leaveForm.get('startDate')?.value,
      endDate: this.leaveForm.get('endDate')?.value,
      reason: this.leaveForm.get('reason')?.value,
      halfDay: this.leaveForm.get('halfDay')?.value,
      halfDayType: this.leaveForm.get('halfDay')?.value ? this.leaveForm.get('halfDayType')?.value : undefined,
      approverId: this.leaveForm.get('approverId')?.value,
      contactDetails: this.leaveForm.get('contactDetails')?.value,
      urgent: this.leaveForm.get('urgent')?.value
    };

    this.leaveService.submitLeaveRequest(leaveRequest).pipe(
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Leave request submitted successfully', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/leaves/my-leaves']);
      },
      error: (error) => {
        console.error('Error submitting leave request:', error);
        this.snackBar.open(error.error?.message || 'Failed to submit leave request. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onDateRangeClick(): void {
    // Only check overlap and eligibility if we have both dates, leave type and have calculated duration
    if (this.leaveForm.get('startDate')?.value &&
      this.leaveForm.get('endDate')?.value &&
      this.leaveForm.get('leaveTypeId')?.value &&
      this.calculatedDuration > 0) {
      this.checkOverlap();
      this.checkEligibility();
    }
  }

  onReset(): void {
    this.leaveForm.reset();
    this.calculatedDuration = 0;
  }
}
