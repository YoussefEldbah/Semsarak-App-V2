import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]],
      role: ['', Validators.required]
    });
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.router.navigate(['/']);
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  closeSuccessMessage(): void {
    this.successMessage = '';
  }

  closeErrorMessage(): void {
    this.errorMessage = '';
  }

  retryRegistration(): void {
    this.errorMessage = '';
    this.onSubmit();
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { username, email, password, nationalId, phoneNumber, role } = this.registerForm.value;
      const data = { username, email, password, nationalId, phoneNumber, role };
      console.log('Sending data:', data);
      console.log('JSON stringified:', JSON.stringify(data));
      try {
        const response = await fetch('https://localhost:7152/api/Account/Register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });
        const result = await response.text();
        if (response.ok) {
          console.log('✅ Registration successful!');
          console.log('Response:', result);
          this.successMessage = result;
          // Store user data in localStorage for profile page
          localStorage.setItem('user', JSON.stringify(data));
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000); // Increased delay to show the success message
        } else {
          console.log('❌ Registration failed!');
          console.log('Status:', response.status);
          console.log('Error:', result);
          this.errorMessage = result || 'Registration failed. Please try again.';
        }
      } catch (error) {
        console.log('❌ Registration failed!');
        console.log('Error:', error);
        this.errorMessage = 'Network error. Please check your connection and try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
// {
//   "username": "string",
//   "email": "user@example.com",
//   "password": "Test@1234",
//   "nationalId": "stringstringst",
//   "role": "Renter"
// }