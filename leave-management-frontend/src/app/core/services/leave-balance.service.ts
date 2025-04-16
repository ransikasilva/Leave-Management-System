import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveBalance } from '../models/leave-balance.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveBalanceService {
  private apiUrl = `${environment.apiUrl}/leave-balances`;

  constructor(private http: HttpClient) { }

  getEmployeeLeaveBalances(employeeId: string): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getEmployeeLeaveBalanceByType(employeeId: string, leaveTypeId: string, year: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/employee/${employeeId}/type/${leaveTypeId}/year/${year}`);
  }

  getEmployeeLeaveBalancesByYear(employeeId: string, year: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.apiUrl}/employee/${employeeId}/year/${year}`);
  }

  updateLeaveBalance(id: string, leaveBalance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.apiUrl}/${id}`, leaveBalance);
  }

  adjustLeaveBalance(id: string, adjustment: number, reason: string): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.apiUrl}/${id}/adjust`, { adjustment, reason });
  }
}
