import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-property-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-property-details.component.html',
  styleUrls: ['./admin-property-details.component.css']
})
export class AdminPropertyDetailsComponent implements OnInit {
  property: any = null;
  loading = true;
  error: string = '';
  showDeleteModal = false;
  isDeleting = false;
  deleteSuccess = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProperty(id);
      }
    });
  }

  async fetchProperty(id: string) {
    this.loading = true;
    this.error = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`https://localhost:7152/api/Admin/property-details/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) {
        this.error = 'Failed to fetch property details.';
        this.loading = false;
        return;
      }
      this.property = await response.json();
    } catch (err: any) {
      this.error = 'Failed to fetch property details.';
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

  async confirmDeleteProperty() {
    if (!this.property?.id) return;
    this.isDeleting = true;
    this.error = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`https://localhost:7152/api/Admin/property/${this.property.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) {
        this.error = 'Failed to delete property.';
        this.isDeleting = false;
        return;
      }
      this.deleteSuccess = 'Property deleted successfully!';
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (err: any) {
      this.error = 'Failed to delete property.';
    } finally {
      this.isDeleting = false;
      this.showDeleteModal = false;
    }
  }
} 