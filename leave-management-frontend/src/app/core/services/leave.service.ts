import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveRequest } from '../models/leave-request.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) { }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.apiUrl);
  }

  getLeaveRequestById(id: string): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
  }

  getLeaveRequestsByEmployee(employeeId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getLeaveRequestsByEmployeeAndStatus(employeeId: string, status: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}/status/${status}`);
  }

  getLeaveRequestsByApprover(approverId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/approver/${approverId}`);
  }

  getLeaveRequestsByApproverAndStatus(approverId: string, status: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/approver/${approverId}/status/${status}`);
  }

  getLeaveRequestsByStatus(status: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/status/${status}`);
  }

  getLeaveRequestsByLeaveType(leaveTypeId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/type/${leaveTypeId}`);
  }

  getLeaveRequestsInDateRange(startDate: Date, endDate: Date): Observable<LeaveRequest[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/date-range`, { params });
  }

  getOverlappingLeaveRequests(startDate: Date, endDate: Date): Observable<LeaveRequest[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/overlapping`, { params });
  }

  getEmployeeLeaveRequestsInDateRange(employeeId: string, startDate: Date, endDate: Date): Observable<LeaveRequest[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}/date-range`, { params });
  }

  getPendingLeaveRequestsByDepartment(departmentId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/department/${departmentId}/pending`);
  }

  submitLeaveRequest(leaveRequest: LeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, leaveRequest);
  }

  approveLeaveRequest(id: string, approverId: string, comments?: string): Observable<LeaveRequest> {
    let params = new HttpParams()
      .set('approverId', approverId);

    if (comments) {
      params = params.set('comments', comments);
    }

    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/approve`, {}, { params });
  }

  rejectLeaveRequest(id: string, approverId: string, comments: string): Observable<LeaveRequest> {
    let params = new HttpParams()
      .set('approverId', approverId)
      .set('comments', comments);

    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/reject`, {}, { params });
  }

  cancelLeaveRequest(id: string, cancellationReason: string): Observable<LeaveRequest> {
    let params = new HttpParams()
      .set('cancellationReason', cancellationReason);

    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/cancel`, {}, { params });
  }

  updateLeaveRequest(id: string, leaveRequest: LeaveRequest): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}`, leaveRequest);
  }

  deleteLeaveRequest(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  checkLeaveEligibility(employeeId: string, leaveTypeId: string, duration: number): Observable<any> {
    let params = new HttpParams()
      .set('employeeId', employeeId)
      .set('leaveTypeId', leaveTypeId)
      .set('duration', duration.toString());

    return this.http.get<any>(`${this.apiUrl}/check-eligibility`, { params });
  }

  checkLeaveOverlap(employeeId: string, startDate: Date, endDate: Date, currentLeaveRequestId?: string): Observable<any> {
    let params = new HttpParams()
      .set('employeeId', employeeId)
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    if (currentLeaveRequestId) {
      params = params.set('currentLeaveRequestId', currentLeaveRequestId);
    }

    return this.http.get<any>(`${this.apiUrl}/check-overlap`, { params });
  }

  calculateLeaveDuration(startDate: Date, endDate: Date, halfDay: boolean = false, halfDayType?: string): Observable<number> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0])
      .set('halfDay', halfDay.toString());

    if (halfDayType) {
      params = params.set('halfDayType', halfDayType);
    }

    return this.http.get<number>(`${this.apiUrl}/calculate-duration`, { params });
  }}
