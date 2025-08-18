import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit {
  user: any = null;
  editMode = false;
  editForm: FormGroup;
  isLoading = false;
  editSuccess = false;
  editError = '';
  changePasswordForm: FormGroup;
  isChangingPassword = false;
  changePasswordSuccess = false;
  changePasswordError = '';
  showChangePassword = false;
  showMyProperties = false;
  myProperties: any[] = [];
  editProperty: any = null;
  editPropertyForm: FormGroup | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined') {
      // Try to get user data from localStorage first
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch {
          this.user = null;
        }
      } else {
        // fallback to JWT if user not found in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          const payload = token.split('.')[1];
          try {
            this.user = JSON.parse(atob(payload));
          } catch {
            this.user = { username: 'Unknown' };
          }
        }
      }
    }
    this.editForm = this.fb.group({
      userName: [this.user?.username || this.user?.userName || '', Validators.required],
      phoneNumber: [this.user?.phoneNumber || '', Validators.required]
    });
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.fetchMyProperties();
  }

  async fetchMyProperties() {
    if (!this.user) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/Property/my-properties', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      this.myProperties = await res.json();
      console.log('myProperties from API:', this.myProperties);
    } catch (err) {
      this.myProperties = [];
      console.error('Error fetching my properties:', err);
    }
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editForm.patchValue({
        userName: this.user?.username || this.user?.userName || '',
        phoneNumber: this.user?.phoneNumber || ''
      });
      this.editSuccess = false;
      this.editError = '';
    }
  }

  async onEditSubmit() {
    if (this.editForm.valid) {
      this.isLoading = true;
      this.editSuccess = false;
      this.editError = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch('https://localhost:7152/api/User/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(this.editForm.value)
        });
        if (response.ok) {
          this.editSuccess = true;
          // Update local user data
          this.user = { ...this.user, ...this.editForm.value };
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(this.user));
          }
          this.editMode = false;
        } else {
          const errorText = await response.text();
          this.editError = errorText || 'Failed to update profile.';
        }
      } catch (err) {
        this.editError = 'Failed to update profile.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onChangePasswordSubmit() {
    if (this.changePasswordForm.valid) {
      this.isChangingPassword = true;
      this.changePasswordSuccess = false;
      this.changePasswordError = '';
      const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;
      if (newPassword !== confirmNewPassword) {
        this.changePasswordError = 'New passwords do not match.';
        this.isChangingPassword = false;
        return;
      }
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch('https://localhost:7152/api/User/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
        });
        const responseBody = await response.text();
        console.log('Change Password API response:', {
          status: response.status,
          ok: response.ok,
          body: responseBody
        });
        if (response.ok) {
          this.changePasswordSuccess = true;
          this.changePasswordForm.reset();
        } else {
          this.changePasswordError = responseBody || 'Failed to change password.';
        }
      } catch (err) {
        this.changePasswordError = 'Failed to change password.';
      } finally {
        this.isChangingPassword = false;
      }
    }
  }

  toggleChangePassword() {
    this.showChangePassword = !this.showChangePassword;
    this.changePasswordSuccess = false;
    this.changePasswordError = '';
  }

  toggleMyProperties() {
    this.showMyProperties = !this.showMyProperties;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  goToMyProperties() {
    this.router.navigate(['/my-properties']);
  }

  goToMyBookings() {
    this.router.navigate(['/my-bookings']);
  }

  startEditProperty(property: any) {
    this.editProperty = property;
    this.editPropertyForm = this.fb.group({
      title: [property.title, Validators.required],
      description: [property.description],
      price: [property.price, Validators.required],
      roomsCount: [property.roomsCount],
      genderPreference: [property.genderPreference],
      city: [property.city, Validators.required],
      region: [property.region, Validators.required],
      street: [property.street],
      status: [property.status]
    });
  }

  async saveEditProperty() {
    if (!this.editPropertyForm?.valid || !this.editProperty) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`https://localhost:7152/api/Property/${this.editProperty.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(this.editPropertyForm.value)
    });
    if (response.ok) {
      await this.fetchMyProperties();
      this.editProperty = null;
      this.editPropertyForm = null;
    } else {
      alert('An error occurred while updating the property.');
    }
  }

  async deleteProperty(id: number) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا العقار؟')) return;
    const token = localStorage.getItem('token');
    const response = await fetch(`https://localhost:7152/api/Property/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (response.ok) {
      await this.fetchMyProperties();
    } else {
      alert('An error occurred while deleting the property.');
    }
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://via.placeholder.com/400x250';
    if (path.startsWith('http')) return path;
    return `https://localhost:7152${path}`;
  }
} 