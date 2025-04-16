import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService } from '../../core/services/department.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  status: 'available' | 'on-leave' | 'partial';
  avatarText: string;
  leaveDetails?: {
    startDate: Date;
    endDate: Date;
    leaveType: string;
    reason?: string;
  };
}

@Component({
  selector: 'app-team-availability',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    DateFormatPipe
  ],
  templateUrl: './team-availability.component.html',
  styleUrls: ['./team-availability.component.scss']
})
export class TeamAvailabilityComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  loading = false;
  managerId = '';
  departmentId = '';
  error = '';

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private authService: AuthService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  private loadUserDetails(): void {
    if (this.authService.currentUserValue?.id) {
      this.loading = true;
      this.employeeService.getEmployeeByUserId(this.authService.currentUserValue.id).subscribe({
        next: (employee) => {
          this.managerId = employee.id!;
          this.departmentId = employee.departmentId!;
          this.loadTeamMembers();
        },
        error: (err) => {
          console.error('Error loading employee details:', err);
          this.error = 'Could not load your employee details';
          this.loading = false;
        }
      });
    }
  }

  private loadTeamMembers(): void {
    this.loading = true;
    this.teamMembers = [];

    // Determine whether to load by manager or department
    const isAdmin = this.authService.hasRole('ROLE_ADMIN');
    const isHR = this.authService.hasRole('ROLE_HR');

    let teamObservable;

    if (isAdmin || isHR) {
      // For admin or HR, load department members
      teamObservable = this.departmentId
        ? this.employeeService.getEmployeesByDepartment(this.departmentId)
        : this.employeeService.getActiveEmployees();
    } else {
      // For managers, load team members
      teamObservable = this.employeeService.getEmployeesByManager(this.managerId);
    }

    teamObservable.pipe(
      catchError(error => {
        console.error('Error loading team members:', error);
        this.error = 'Could not load team members';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(employees => {
      if (employees.length === 0) {
        return;
      }

      // Build basic team members array
      const today = new Date();
      const members: TeamMember[] = employees.map(emp => ({
        id: emp.id!,
        name: `${emp.firstName} ${emp.lastName}`,
        position: emp.designation || 'Employee',
        department: '', // Will be filled later
        status: 'available',
        avatarText: `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`
      }));

      // Get department details for each employee with a department
      const departmentIds = [...new Set(employees
        .filter(emp => emp.departmentId)
        .map(emp => emp.departmentId!))];

      if (departmentIds.length > 0) {
        const departmentRequests = departmentIds.map(id =>
          this.departmentService.getDepartmentById(id).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(departmentRequests).subscribe(departments => {
          const deptMap = new Map();
          departments.filter(Boolean).forEach(dept => {
            if (dept) {
              deptMap.set(dept.id, dept.name);
            }
          });

          // Add department names to team members
          members.forEach(member => {
            const emp = employees.find(e => e.id === member.id);
            if (emp && emp.departmentId && deptMap.has(emp.departmentId)) {
              member.department = deptMap.get(emp.departmentId);
            }
          });

          this.checkLeaveStatus(members);
        });
      } else {
        this.checkLeaveStatus(members);
      }
    });
  }

  private checkLeaveStatus(members: TeamMember[]): void {
    if (members.length === 0) {
      this.teamMembers = [];
      return;
    }

    const today = new Date();
    const memberIds = members.map(m => m.id);

    // Get leave requests for all team members
    const leaveRequests = memberIds.map(id =>
      this.leaveService.getLeaveRequestsByEmployeeAndStatus(id, 'APPROVED').pipe(
        catchError(() => of([]))
      )
    );

    forkJoin(leaveRequests).subscribe(allLeaves => {
      // Process leave status for each member
      members.forEach((member, index) => {
        const employeeLeaves = allLeaves[index];

        // Check if employee is currently on leave
        const currentLeave = employeeLeaves.find(leave => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          return today >= startDate && today <= endDate;
        });

        // Check if employee has upcoming leave in the next 7 days
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const upcomingLeave = employeeLeaves.find(leave => {
          const startDate = new Date(leave.startDate);
          return startDate > today && startDate <= nextWeek;
        });

        if (currentLeave) {
          member.status = 'on-leave';
          member.leaveDetails = {
            startDate: new Date(currentLeave.startDate),
            endDate: new Date(currentLeave.endDate),
            leaveType: currentLeave.leaveTypeId, // This will need to be replaced with the actual type name
            reason: currentLeave.reason
          };
        } else if (upcomingLeave) {
          member.status = 'partial';
          member.leaveDetails = {
            startDate: new Date(upcomingLeave.startDate),
            endDate: new Date(upcomingLeave.endDate),
            leaveType: upcomingLeave.leaveTypeId, // This will need to be replaced with the actual type name
            reason: upcomingLeave.reason
          };
        }
      });

      // Sort by status: on-leave, partial, available
      this.teamMembers = members.sort((a, b) => {
        const statusOrder = {
          'on-leave': 0,
          'partial': 1,
          'available': 2
        };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    });
  }
}
