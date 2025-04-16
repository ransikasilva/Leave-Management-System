import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveType } from '../../core/models/leave-type.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-leave-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './leave-type-form.component.html',
  styleUrls: ['./leave-type-form.component.scss']
})
export class LeaveTypeFormComponent implements OnInit {
  leaveTypeForm!: FormGroup;
  isEditMode = false;
  leaveTypeId = '';
  loading = false;
  submitting = false;
  isAdmin = false;
  isHR = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private leaveTypeService: LeaveTypeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isHR = this.authService.hasRole('ROLE_HR');

    if (!this.isAdmin && !this.isHR) {
      this.router.navigate(['/leave-types']);
      return;
    }

    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.leaveTypeId = params['id'];
        this.loadLeaveType(this.leaveTypeId);
      }
    });
  }

  initializeForm(): void {
    this.leaveTypeForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      defaultDays: [0, [Validators.required, Validators.min(0)]],
      paidLeave: [true],
      requiresApproval: [true],
      active: [true],
      allowHalfDay: [true],
      carryForward: [false],
      maxCarryForwardDays: [0]
    });

    this.leaveTypeForm.get('carryForward')?.valueChanges.subscribe(carryForward => {
      const maxCarryForwardDaysControl = this.leaveTypeForm.get('maxCarryForwardDays');
      if (carryForward) {
        maxCarryForwardDaysControl?.enable();
        maxCarryForwardDaysControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        maxCarryForwardDaysControl?.disable();
        maxCarryForwardDaysControl?.clearValidators();
        maxCarryForwardDaysControl?.setValue(0);
      }
      maxCarryForwardDaysControl?.updateValueAndValidity();
    });
  }

  loadLeaveType(id: string): void {
    this.loading = true;

    this.leaveTypeService.getLeaveTypeById(id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (leaveType) => {
        this.leaveTypeForm.patchValue({
          name: leaveType.name,
          description: leaveType.description,
          defaultDays: leaveType.defaultDays,
          paidLeave: leaveType.paidLeave,
          requiresApproval: leaveType.requiresApproval,
          active: leaveType.active,
          allowHalfDay: leaveType.allowHalfDay,
          carryForward: leaveType.carryForward || false,
          maxCarryForwardDays: leaveType.maxCarryForwardDays || 0
        });

        if (!leaveType.carryForward) {
          this.leaveTypeForm.get('maxCarryForwardDays')?.disable();
        }
      },
      error: (error) => {
        console.error('Error loading leave type:', error);
        this.snackBar.open('Failed to load leave type details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/leave-types']);
      }
    });
  }

  onSubmit(): void {
    if (this.leaveTypeForm.invalid) {
      Object.keys(this.leaveTypeForm.controls).forEach(key => {
        const control = this.leaveTypeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const leaveTypeData: LeaveType = {
      ...this.leaveTypeForm.value,
      maxCarryForwardDays: this.leaveTypeForm.get('carryForward')?.value ?
        this.leaveTypeForm.get('maxCarryForwardDays')?.value : 0
    };

    if (this.isEditMode) {
      this.leaveTypeService.updateLeaveType(this.leaveTypeId, leaveTypeData).pipe(
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Leave type updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/leave-types']);
        },
        error: (error) => {
          console.error('Error updating leave type:', error);
          this.snackBar.open(error.error?.message || 'Failed to update leave type', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.leaveTypeService.createLeaveType(leaveTypeData).pipe(
        finalize(() => {
          this.submitting = false;
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Leave type created successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/leave-types']);
        },
        error: (error) => {
          console.error('Error creating leave type:', error);
          this.snackBar.open(error.error?.message || 'Failed to create leave type', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadLeaveType(this.leaveTypeId);
    } else {
      this.leaveTypeForm.reset({
        paidLeave: true,
        requiresApproval: true,
        active: true,
        allowHalfDay: true,
        carryForward: false,
        maxCarryForwardDays: 0,
        defaultDays: 0
      });
    }
  }
}
