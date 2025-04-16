import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div>
      <h2>Auth Debug</h2>

      <button (click)="testDirectRequest()">Test Direct Request</button>
      <button (click)="testExplicitAuth()">Test With Explicit Header</button>

      <h3>Token Information</h3>
      <pre>{{ tokenInfo }}</pre>

      <h3>Result</h3>
      <pre>{{ result | json }}</pre>
    </div>
  `
})
export class AuthDebugComponent implements OnInit {
  result: any = null;
  tokenInfo: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Log token on init
    const token = localStorage.getItem('auth_token');
    this.tokenInfo = `Token found: ${token ? 'Yes' : 'No'}\n`;

    if (token) {
      this.tokenInfo += `Token starts with: ${token.substring(0, 20)}...\n`;
      this.tokenInfo += `Token length: ${token.length}\n`;

      try {
        // List all localStorage keys
        this.tokenInfo += 'All localStorage keys:\n';
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key !== null) { // Ensure key is not null (though localStorage.key(i) should not return null)
            const value = localStorage.getItem(key);
            const displayValue = value
              ? value.length > 20
                ? value.substring(0, 10) + '...'
                : value
              : 'null';
            this.tokenInfo += `${key}: ${displayValue}\n`;
          }
        }
      } catch (error) {
        this.tokenInfo += `Error accessing localStorage: ${error}`;
      }
    }
  }

  testDirectRequest(): void {
    // This should use the interceptor
    this.http.get('http://localhost:8080/api/test/headers').subscribe({
      next: (response) => {
        console.log('Direct request successful:', response);
        this.result = response;
      },
      error: (error) => {
        console.error('Direct request failed:', error);
        this.result = error;
      }
    });
  }

  testExplicitAuth(): void {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      this.result = { error: 'No token in localStorage' };
      return;
    }

    // Set the header explicitly
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Making request with explicit Authorization header');

    this.http.get('http://localhost:8080/api/test/headers', { headers }).subscribe({
      next: (response) => {
        console.log('Explicit auth request successful:', response);
        this.result = response;
      },
      error: (error) => {
        console.error('Explicit auth request failed:', error);
        this.result = error;
      }
    });
  }
}
