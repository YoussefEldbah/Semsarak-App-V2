import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-user-details.component.html',
  styleUrls: ['./admin-user-details.component.css']
})
export class AdminUserDetailsComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string = '';
  showDeleteModal = false;
  isDeleting = false;
  successMessage = '';
  newRole: string = '';
  isChangingRole = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchUser(id);
      }
    });
  }

  async fetchUser(id: string) {
    this.loading = true;
    this.error = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`https://localhost:7152/api/Admin/user/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) {
        this.error = 'Failed to fetch user details.';
        this.loading = false;
        return;
      }
      this.user = await response.json();
    } catch (err: any) {
      this.error = 'Failed to fetch user details.';
    } finally {
      this.loading = false;
    }
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  async confirmDeleteUser() {
    if (!this.user?.id) return;
    this.isDeleting = true;
    this.error = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`https://localhost:7152/api/Admin/user/${this.user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) {
        this.error = 'Failed to delete user.';
        this.isDeleting = false;
        return;
      }
      this.successMessage = 'User deleted successfully!';
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 1500);
    } catch (err: any) {
      this.error = 'Failed to delete user.';
    } finally {
      this.isDeleting = false;
      this.showDeleteModal = false;
    }
  }

  changeUserRole() {
    if (!this.user?.id || !this.newRole || !['Renter', 'Owner'].includes(this.newRole)) return;
    this.isChangingRole = true;
    this.error = '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    this.http.put(
      `https://localhost:7152/api/Admin/users/${this.user.id}/change-role?newRole=${this.newRole}`,
      {},
      { headers: { 'Authorization': 'Bearer ' + token } }
    ).subscribe({
      next: () => {
        if (this.user.roles && Array.isArray(this.user.roles)) {
          this.user.roles = [this.newRole];
        } else {
          this.user.role = this.newRole;
        }
        this.successMessage = 'Role changed successfully! 🎉';
        this.isChangingRole = false;
        setTimeout(() => this.successMessage = '', 2500);
      },
      error: (err) => {
        console.error('Error changing user role:', err);
        this.isChangingRole = false;
        if (err.status === 400 || err.status === 500) {
          this.error = 'Failed to change user role.';
        } else {
          this.successMessage = 'Role changed successfully! 🎉';
          setTimeout(() => this.successMessage = '', 2500);
        }
      },
      complete: () => {
        this.isChangingRole = false;
      }
    });
  }
} 