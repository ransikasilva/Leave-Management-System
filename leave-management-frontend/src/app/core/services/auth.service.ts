import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, JwtResponse } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null); // Initialize as null first
  public user$ = this.userSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`;
  private jwtHelper = new JwtHelperService(); // Create a new instance directly
  private tokenExpirationTimer: any;
  private authStateReady = new BehaviorSubject<boolean>(false); // Start as false

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize user after all dependencies are set
    setTimeout(() => {
      this.userSubject.next(this.getUserFromStorage());
      this.authStateReady.next(this.isLoggedIn);
      this.checkTokenExpiration();
    }, 0);
  }

  get authReady$(): Observable<boolean> {
    return this.authStateReady.asObservable();
  }

  get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    try {
      const token = localStorage.getItem(environment.tokenKey);
      return !!token && !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  get userRoles(): string[] {
    return this.currentUserValue?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  private getUserFromStorage(): User | null {
    try {
      const token = localStorage.getItem(environment.tokenKey);
      if (!token) {
        console.log('AuthService: No token found in localStorage');
        return null;
      }

      const decodedToken = this.jwtHelper.decodeToken(token);
      if (!decodedToken) {
        console.warn('AuthService: Could not decode token');
        return null;
      }

      return {
        id: decodedToken.id || decodedToken.sub || '',
        username: decodedToken.sub || '',
        email: decodedToken.email || '',
        firstName: decodedToken.firstName || '',
        lastName: decodedToken.lastName || '',
        roles: this.parseRoles(decodedToken),
        employeeId: decodedToken.employeeId
      };
    } catch (error) {
      console.error('AuthService: Error getting user from storage:', error);
      return null;
    }
  }

  // Helper method to parse roles from token
  private parseRoles(decodedToken: any): string[] {
    if (Array.isArray(decodedToken.roles)) {
      return decodedToken.roles;
    }

    if (decodedToken.authorities) {
      return typeof decodedToken.authorities === 'string'
        ? decodedToken.authorities.split(',')
        : decodedToken.authorities;
    }

    return [];
  }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    console.log('AuthService: Attempting login for:', loginRequest.username);
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          console.log('AuthService: Login successful, setting session');
          this.setSession(response);
          this.startTokenExpirationTimer();
          this.authStateReady.next(true);
          this.toastr.success('Login successful', 'Welcome');
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        tap(response => {
          this.setSession(response);
          this.startTokenExpirationTimer();
          this.authStateReady.next(true);
          this.toastr.success('Registration successful', 'Welcome');
        })
      );
  }

  logout(): void {
    console.log('AuthService: Logging out user');
    try {
      const token = localStorage.getItem(environment.tokenKey);

      // Only make the backend call if we have a token
      if (token && this.http) {
        // Fire and forget, don't wait for response
        this.http.post(`${this.apiUrl}/logout`, { token }).subscribe({
          next: () => console.log('AuthService: Logout successful on server'),
          error: (err) => console.error('AuthService: Error logging out on server:', err)
        });
      }
    } catch (error) {
      console.error('AuthService: Error during logout:', error);
    }

    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    this.userSubject.next(null);
    this.stopTokenExpirationTimer();
    this.authStateReady.next(false);
    void this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<JwtResponse> {
    try {
      const refreshToken = localStorage.getItem(environment.refreshTokenKey);
      if (!refreshToken) {
        console.warn('AuthService: No refresh token available');
        return of(null as any);
      }

      console.log('AuthService: Attempting to refresh token');
      return this.http.post<JwtResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
        .pipe(
          tap(response => {
            console.log('AuthService: Token refresh successful');
            this.setSession(response);
            this.startTokenExpirationTimer();
          }),
          catchError((error) => {
            console.error('AuthService: Error refreshing token:', error);
            this.logout();
            return of(null as any);
          })
        );
    } catch (error) {
      console.error('AuthService: Error in refreshToken:', error);
      return of(null as any);
    }
  }

  private setSession(authResult: JwtResponse): void {
    if (!authResult || !authResult.token) {
      console.error('AuthService: Invalid auth result received:', authResult);
      return;
    }

    try {
      // Store the tokens
      localStorage.setItem(environment.tokenKey, authResult.token);
      localStorage.setItem(environment.refreshTokenKey, authResult.refreshToken);
      console.log('AuthService: Token stored in localStorage (first 20 chars):', authResult.token.substring(0, 20) + '...');

      const decodedToken = this.jwtHelper.decodeToken(authResult.token);
      console.log('AuthService: Token decoded successfully');

      // Build user object from token and response
      const user: User = {
        id: authResult.id || decodedToken.sub || '',
        username: authResult.username || decodedToken.sub || '',
        email: authResult.email || decodedToken.email || '',
        roles: authResult.roles || this.parseRoles(decodedToken),
        firstName: decodedToken.firstName || '',
        lastName: decodedToken.lastName || '',
        employeeId: decodedToken.employeeId
      };

      this.userSubject.next(user);
    } catch (error) {
      console.error('AuthService: Error setting session:', error);
    }
  }

  private checkTokenExpiration(): void {
    try {
      const token = localStorage.getItem(environment.tokenKey);
      if (!token) {
        this.authStateReady.next(false);
        return;
      }

      if (!this.jwtHelper.isTokenExpired(token)) {
        console.log('AuthService: Valid token found, starting expiration timer');
        this.startTokenExpirationTimer();
        this.authStateReady.next(true);
      } else {
        console.log('AuthService: Expired token found, attempting refresh');
        this.refreshToken().subscribe({
          next: (result) => {
            if (result) {
              this.authStateReady.next(true);
            } else {
              this.authStateReady.next(false);
            }
          },
          error: () => this.authStateReady.next(false)
        });
      }
    } catch (error) {
      console.error('AuthService: Error checking token expiration:', error);
      this.authStateReady.next(false);
    }
  }

  private startTokenExpirationTimer(): void {
    try {
      this.stopTokenExpirationTimer();

      const token = localStorage.getItem(environment.tokenKey);
      if (!token) return;

      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      if (!expirationDate) {
        console.warn('AuthService: No expiration date in token');
        return;
      }

      const timeout = expirationDate.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiration
      if (timeout <= 0) {
        console.warn('AuthService: Token already expired or about to expire');
        this.refreshToken().subscribe();
        return;
      }

      console.log(`AuthService: Token will expire in ${Math.round(timeout/1000/60)} minutes. Setting refresh timer.`);
      this.tokenExpirationTimer = setTimeout(() => {
        console.log('AuthService: Token expiration timer triggered');
        this.refreshToken().subscribe();
      }, timeout);
    } catch (error) {
      console.error('AuthService: Error starting token expiration timer:', error);
    }
  }

  private stopTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}
