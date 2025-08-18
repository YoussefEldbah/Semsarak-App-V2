import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <div class="card shadow-lg border-0 rounded-4 p-4">
            <h2 class="text-center mb-4"><i class="fas fa-plus me-2 text-primary"></i>Add Property</h2>
            <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" formControlName="title">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Price</label>
                  <input type="number" class="form-control" formControlName="price">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" formControlName="description" rows="2"></textarea>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Rooms Count</label>
                  <input type="number" class="form-control" formControlName="roomsCount">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Gender Preference</label>
                  <select class="form-control" formControlName="genderPreference">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">City</label>
                  <input type="text" class="form-control" formControlName="city">
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Region</label>
                  <input type="text" class="form-control" formControlName="region">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Street</label>
                  <input type="text" class="form-control" formControlName="street">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Property Images</label>
                <input type="file" class="form-control" (change)="onFileChange($event)" multiple>
              </div>
              <div class="d-flex gap-2 justify-content-center">
                <button type="submit" class="btn btn-primary" [disabled]="propertyForm.invalid || isLoading">
                  <span *ngIf="!isLoading"><i class="fas fa-plus me-1"></i> Add Property</span>
                  <span *ngIf="isLoading"><i class="fas fa-spinner fa-spin me-1"></i> Adding...</span>
                </button>
              </div>
            </form>
            <div *ngIf="successMessage" class="alert alert-success mt-3 text-center">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="alert alert-danger mt-3 text-center">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class AddPropertyComponent {
  propertyForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  images: File[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      roomsCount: [1, [Validators.required, Validators.min(1)]],
      genderPreference: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      street: ['', Validators.required],
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.images = Array.from(event.target.files);
    }
  }

  async onSubmit() {
    if (this.propertyForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('https://localhost:7152/api/Property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(this.propertyForm.value)
      });
      const result = await response.json();
      if (response.ok && result && result.id) {
        // Upload images if any
        if (this.images.length > 0) {
          const formData = new FormData();
          this.images.forEach(img => formData.append('Images', img)); // Use 'Images' with capital I
          const imgRes = await fetch(`https://localhost:7152/api/property/${result.id}/images`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token
            },
            body: formData
          });
          if (!imgRes.ok) {
            this.errorMessage = 'Property added, but failed to upload images.';
            this.isLoading = false;
            return;
          }
        }
        this.successMessage = 'Property added successfully!';
        this.propertyForm.reset();
        this.images = [];
      } else {
        this.errorMessage = 'Failed to add property.';
      }
    } catch (err) {
      this.errorMessage = 'Failed to add property.';
    } finally {
      this.isLoading = false;
    }
  }
} 