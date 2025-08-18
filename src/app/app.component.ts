import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'semsarak-app';
  constructor(private router: Router) {}

  isAdminRoute(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      const isAdmin = Array.isArray(user.roles)
        ? user.roles.includes('Admin')
        : user.role === 'Admin';
      return isAdmin && this.router.url.startsWith('/admin');
    } catch {
      return false;
    }
  }
}
