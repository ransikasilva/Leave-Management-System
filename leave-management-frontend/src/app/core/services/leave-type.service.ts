import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveType } from '../models/leave-type.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private apiUrl = `${environment.apiUrl}/leave-types`;

  constructor(private http: HttpClient) { }

  getAllLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.apiUrl);
  }

  getLeaveTypeById(id: string): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.apiUrl}/${id}`);
  }

  getLeaveTypeByName(name: string): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.apiUrl}/name/${name}`);
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/active`);
  }

  getPaidLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/paid`);
  }

  getUnpaidLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/unpaid`);
  }

  getLeaveTypesRequiringApproval(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/requires-approval`);
  }

  createLeaveType(leaveType: LeaveType): Observable<LeaveType> {
    return this.http.post<LeaveType>(this.apiUrl, leaveType);
  }

  updateLeaveType(id: string, leaveType: LeaveType): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/${id}`, leaveType);
  }

  deleteLeaveType(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activateLeaveType(id: string): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateLeaveType(id: string): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
