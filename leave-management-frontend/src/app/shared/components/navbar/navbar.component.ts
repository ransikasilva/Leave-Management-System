import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { User } from '../../../core/models/user.model';
import {MatDivider} from '@angular/material/list';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDivider
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  unreadNotificationCount = 0;
  private userSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe((user: any) => {
      this.currentUser = user;
    });

    this.notificationSubscription = this.notificationService.unreadCount$.subscribe((count: number) => {
      this.unreadNotificationCount = count;
    });

    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }
}
