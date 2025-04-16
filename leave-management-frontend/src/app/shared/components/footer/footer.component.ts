import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p class="footer-text">
          &copy; {{ currentYear }} Leave Management System. All rights reserved.
        </p>
        <p class="footer-version">
          Version 1.0.0
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #ffffff;
      border-top: 1px solid #eee;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;

      @media (max-width: 576px) {
        flex-direction: column;
        gap: 8px;
      }
    }

    .footer-text, .footer-version {
      margin: 0;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
