import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { LeaveService } from '../../core/services/leave.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LeaveTypeService } from '../../core/services/leave-type.service';
import { LeaveRequest } from '../../core/models/leave-request.model';
import { Employee } from '../../core/models/employee.model';
import { LeaveType } from '../../core/models/leave-type.model';

interface CalendarDay {
  day: number;
  inMonth: boolean;
  isToday: boolean;
  date: Date;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  color: string;
  leaveType: string;
  employeeName: string;
}

@Component({
  selector: 'app-leave-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.scss']
})
export class LeaveCalendarComponent implements OnInit {
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  currentMonthName = '';
  loading = false;
  employeeMap = new Map<string, Employee>();
  leaveTypeMap = new Map<string, LeaveType>();
  typeColorMap = new Map<string, string>([
    ['Annual Leave', '#4caf50'],
    ['Sick Leave', '#f44336'],
    ['Personal Leave', '#ff9800'],
    ['Work From Home', '#2196f3'],
    ['Maternity Leave', '#9c27b0'],
    ['Paternity Leave', '#673ab7'],
    ['Unpaid Leave', '#607d8b']
  ]);

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private leaveTypeService: LeaveTypeService
  ) {}

  ngOnInit(): void {
    this.updateCalendar();
    this.loadTeamLeaves();
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.updateCalendar();
    this.loadTeamLeaves();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.updateCalendar();
    this.loadTeamLeaves();
  }

  updateCalendar(): void {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    this.currentMonthName = date.toLocaleString('default', { month: 'long' });

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDayOfMonth = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    this.calendarDays = [];

    // Add days from previous month
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      this.calendarDays.push({
        day: prevMonthDays - i,
        inMonth: false,
        isToday: false,
        date: new Date(this.currentYear, this.currentMonth - 1, prevMonthDays - i),
        events: []
      });
    }

    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push({
        day: i,
        inMonth: true,
        isToday: today.getDate() === i &&
          today.getMonth() === this.currentMonth &&
          today.getFullYear() === this.currentYear,
        date: date,
        events: []
      });
    }

    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        day: i,
        inMonth: false,
        isToday: false,
        date: new Date(this.currentYear, this.currentMonth + 1, i),
        events: []
      });
    }
  }

  loadTeamLeaves(): void {
    this.loading = true;

    // Clear existing events
    this.calendarDays.forEach(day => {
      day.events = [];
    });

    // Get first and last day of current month view
    const startDate = new Date(this.currentYear, this.currentMonth, 1);
    const endDate = new Date(this.currentYear, this.currentMonth + 1, 0);

    // First, fetch all the leave types to get their colors
    this.leaveTypeService.getAllLeaveTypes().pipe(
      catchError(error => {
        console.error('Error fetching leave types:', error);
        return of([]);
      }),
      switchMap(leaveTypes => {
        // Store leave types in a map for quick access
        leaveTypes.forEach(type => {
          this.leaveTypeMap.set(type.id!, type);
        });

        // Next, fetch all approved leaves in the date range
        return this.leaveService.getLeaveRequestsInDateRange(startDate, endDate).pipe(
          catchError(error => {
            console.error('Error fetching leave requests:', error);
            return of([]);
          })
        );
      }),
      switchMap(leaves => {
        // Filter for only approved leaves
        const approvedLeaves = leaves.filter(leave => leave.status === 'APPROVED');

        if (approvedLeaves.length === 0) {
          return of([]);
        }

        // Get unique employee IDs from the leaves
        const employeeIds = [...new Set(approvedLeaves.map(leave => leave.employeeId))];

        // Fetch employee data for all employees with approved leaves
        const employeeRequests = employeeIds.map(id =>
          this.employeeService.getEmployeeById(id).pipe(
            catchError(error => {
              console.error(`Error fetching employee ${id}:`, error);
              return of(null);
            })
          )
        );

        return forkJoin(employeeRequests).pipe(
          switchMap(employees => {
            // Store employees in a map for quick access
            employees.filter(Boolean).forEach(employee => {
              if (employee) {
                this.employeeMap.set(employee.id!, employee);
              }
            });

            return of(approvedLeaves);
          })
        );
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(leaves => {
      this.processLeaves(leaves);
    });
  }

  processLeaves(leaves: LeaveRequest[]): void {
    // Process each leave and add as events to calendar days
    leaves.forEach(leave => {
      const startDay = new Date(leave.startDate).getTime();
      const endDay = new Date(leave.endDate).getTime();

      this.calendarDays.forEach(day => {
        const currentDay = day.date.getTime();

        // Check if this calendar day is within the leave period
        if (currentDay >= startDay && currentDay <= endDay) {
          const employee = this.employeeMap.get(leave.employeeId);
          const leaveType = this.leaveTypeMap.get(leave.leaveTypeId);

          if (employee && leaveType) {
            // Get color from the map or use default
            const color = this.typeColorMap.get(leaveType.name) || '#3f51b5';

            day.events.push({
              id: leave.id!,
              title: `${employee.firstName} ${employee.lastName}`,
              color: color,
              leaveType: leaveType.name,
              employeeName: `${employee.firstName} ${employee.lastName}`
            });
          }
        }
      });
    });
  }
}
