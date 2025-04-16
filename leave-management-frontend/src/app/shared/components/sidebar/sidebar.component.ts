import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Leave Management',
      icon: 'event_note',
      expanded: false,
      children: [
        {
          label: 'My Leaves',
          icon: 'event',
          route: '/leaves/my-leaves'
        },
        {
          label: 'Apply for Leave',
          icon: 'add_circle',
          route: '/leaves/apply'
        },
        {
          label: 'Leave Balance',
          icon: 'account_balance',
          route: '/leaves/balance'
        },
        {
          label: 'Approvals',
          icon: 'how_to_reg',
          route: '/leaves/approvals',
          roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER']
        }
      ]
    },
    {
      label: 'Employee Management',
      icon: 'people',
      expanded: false,
      roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'],
      children: [
        {
          label: 'Employees',
          icon: 'person',
          route: '/employees',
          roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER']
        },
        {
          label: 'Departments',
          icon: 'business',
          route: '/departments',
          roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER']
        }
      ]
    },
    {
      label: 'Administration',
      icon: 'admin_panel_settings',
      expanded: false,
      roles: ['ROLE_ADMIN', 'ROLE_HR'],
      children: [
        {
          label: 'Users',
          icon: 'manage_accounts',
          route: '/users',
          roles: ['ROLE_ADMIN']
        },
        {
          label: 'Leave Types',
          icon: 'category',
          route: '/leave-types',
          roles: ['ROLE_ADMIN', 'ROLE_HR']
        },
        {
          label: 'Holidays',
          icon: 'today',
          route: '/holidays',
          roles: ['ROLE_ADMIN', 'ROLE_HR']
        }
      ]
    },
    {
      label: 'Reports',
      icon: 'assessment',
      route: '/reports',
      roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER']
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  filteredMenuItems: MenuItem[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.filterMenuItems();
  }

  filterMenuItems(): void {
    this.filteredMenuItems = this.menuItems.filter(item => {
      return this.hasPermission(item);
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => this.hasPermission(child))
        };
      }
      return item;
    });
  }

  hasPermission(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.some(role => this.authService.hasRole(role));
  }
}
