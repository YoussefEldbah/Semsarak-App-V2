import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  get isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  isOwner(): boolean {
    if (typeof window === 'undefined') return false;
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      if (Array.isArray(user.roles)) {
        return user.roles.includes('Owner');
      }
      return user.role === 'Owner';
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    if (typeof window === 'undefined') return false;
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      if (Array.isArray(user.roles)) {
        return user.roles.includes('Admin');
      }
      return user.role === 'Admin';
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
