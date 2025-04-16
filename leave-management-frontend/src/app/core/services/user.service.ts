import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  changePassword(id: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/change-password`, newPassword);
  }

  updateProfilePicture(id: string, profilePictureUrl: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/profile-picture`, profilePictureUrl);
  }

  enableUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/enable`, {});
  }

  disableUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/disable`, {});
  }
}
