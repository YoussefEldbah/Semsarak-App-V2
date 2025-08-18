import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.router.navigate(['/']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { username, password } = this.loginForm.value;
      console.log('Sending login data:', { Username: username, Password: password });

      try {
        const response = await fetch('https://localhost:7152/api/Account/Login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ Username: username, Password: password })
        });
        const resultText = await response.text();
        let result: any = {};
        try {
          result = JSON.parse(resultText);
        } catch (e) {
          result = resultText;
        }
        console.log('Login API result:', result);
        if (response.ok) {
          console.log('✅ Login successful!');
          console.log('Response:', result);
          if (result && result.token) {
            localStorage.setItem('token', result.token);
          }
          
          // Store user data if available
          let userData: any = {};
          if (result && result.user) {
            userData = result.user;
            localStorage.setItem('user', JSON.stringify(result.user));
          } else if (result && result.username) {
            userData = {
              username: result.username,
              email: result.email,
              nationalId: result.nationalId,
              role: result.role
            };
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          // Check if user is Admin and redirect accordingly
          const isAdmin = Array.isArray(userData.roles) 
            ? userData.roles.includes('Admin')
            : userData.role === 'Admin';
          
          this.successMessage = 'Login successful. Redirecting...';
          
          setTimeout(() => {
            if (isAdmin) {
              console.log('Redirecting Admin to dashboard...');
              this.router.navigate(['/admin']);
            } else {
              console.log('Redirecting regular user to home...');
              this.router.navigate(['/']);
            }
          }, 1000);
        } else {
          console.log('❌ Login failed!');
          console.log('Status:', response.status);
          console.log('Error:', result);
          this.errorMessage = (result && result.title) || result || 'Login failed. Please try again.';
        }
      } catch (error) {
        console.log('❌ Login failed!');
        console.log('Error:', error);
        this.errorMessage = 'Login failed. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  signInWithGoogle(): void {
    // TODO: Implement Google OAuth
    console.log('Signing in with Google...');
  }
}
