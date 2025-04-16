import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) { }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getActiveEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/active`);
  }

  getInactiveEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/inactive`);
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  getEmployeeByUserId(userId: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/user/${userId}`);
  }

  getEmployeesByDepartment(departmentId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  getEmployeesByManager(managerId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activateEmployee(id: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateEmployee(id: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  assignManager(id: string, managerId: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}/manager/${managerId}`, {});
  }

  changeDepartment(id: string, departmentId: string): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}/department/${departmentId}`, {});
  }
}
