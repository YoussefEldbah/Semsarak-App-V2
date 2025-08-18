import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AddPropertyComponent } from './pages/add-property/add-property.component';
import { OwnerPropertiesComponent } from './pages/owner-properties/owner-properties.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminUserDetailsComponent } from './pages/admin-user-details/admin-user-details.component';
import { AdminPropertyDetailsComponent } from './pages/admin-property-details/admin-property-details.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function adminGuard() {
  const router = inject(Router);
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.role === 'Admin' || (user.roles && user.roles.includes('Admin')))) {
          return true;
        }
      } catch {}
    }
  }
  router.navigate(['/']);
  return false;
}

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'add-property', component: AddPropertyComponent },
  { path: 'my-properties', component: OwnerPropertiesComponent },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [() => {
      const router = inject(Router);
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && (user.role === 'Admin' || (user.roles && user.roles.includes('Admin')))) {
              return true;
            }
          } catch {}
        }
      }
      router.navigate(['/']);
      return false;
    }],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'users', component: AdminUserDetailsComponent },
      { path: 'users/:id', component: AdminUserDetailsComponent },
      { path: 'properties', component: AdminPropertyDetailsComponent },
      { path: 'properties/:id', component: AdminPropertyDetailsComponent },
    ]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [() => {
      const router = inject(Router);
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && (user.role === 'Renter' || (user.roles && user.roles.includes('Renter')))) {
              return true;
            }
          } catch {}
        }
      }
      router.navigate(['/']);
      return false;
    }]
  },
  {
    path: 'property-details/:id',
    loadComponent: () => import('./pages/property-details/property-details.component').then(m => m.PropertyDetailsComponent)
  },
  { path: 'payment-callback', loadComponent: () => import('./pages/payment-callback/payment-callback.component').then(m => m.PaymentCallbackComponent) },
  { path: 'payment-success', loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
  { path: '**', redirectTo: '' }
];



// http://localhost:4200/payment-callback?id=323022024