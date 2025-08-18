import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  roomsCount?: number;
  genderPreference?: string;
  city?: string;
  region?: string;
  street?: string;
  imagePaths?: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit {
  propertyId!: number;
  property: Property | null = null;
  images: string[] = [];
  loading = true;
  error: string | null = null;
  currentImageIndex = 0;

  // Booking modal state
  showBookingModal = false;
  bookingStartDate: string = '';
  bookingEndDate: string = '';
  bookingLoading = false;
  bookingError: string = '';
  bookingSuccess: string = '';
  isRenter: boolean = false;

  constructor(private route: ActivatedRoute) {
    // Check user role
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (Array.isArray(user.roles)) {
            this.isRenter = user.roles.includes('Renter');
          } else {
            this.isRenter = user.role === 'Renter';
          }
        } catch {}
      }
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.propertyId = +id;
        this.property = null;
        this.images = [];
        this.loading = true;
        this.currentImageIndex = 0;
        this.fetchPropertyDetails();
        this.fetchPropertyImages();
      }
    });
  }

  nextImage() {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }

  openBookingModal() {
    this.bookingStartDate = '';
    this.bookingEndDate = '';
    this.bookingError = '';
    this.bookingSuccess = '';
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.bookingError = '';
    this.bookingSuccess = '';
  }

  async submitBooking() {
    if (!this.bookingStartDate || !this.bookingEndDate) {
      this.bookingError = 'Please select both start and end dates.';
      return;
    }
    this.bookingLoading = true;
    this.bookingError = '';
    this.bookingSuccess = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/Booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          propertyId: this.propertyId,
          startDate: this.bookingStartDate,
          endDate: this.bookingEndDate
        })
      });
      const responseText = await res.text();
      let responseJson: any = {};
      try {
        responseJson = JSON.parse(responseText);
      } catch { responseJson = responseText; }
      console.log('Booking API response:', responseJson);
      if (!res.ok) {
        this.bookingError = responseJson?.message || responseJson || 'Failed to create booking.';
        this.bookingLoading = false;
        return;
      }
      this.bookingSuccess = 'Booking request sent! Status: Pending.';
      this.showBookingModal = false;
      setTimeout(() => { this.bookingSuccess = ''; }, 4000);
    } catch (err: any) {
      this.bookingError = err.message || 'Error creating booking.';
    } finally {
      this.bookingLoading = false;
    }
  }

  async fetchPropertyDetails() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch(`https://localhost:7152/api/Property/${this.propertyId}`, { headers });
      if (!res.ok) {
        if (res.status === 403) {
          this.error = 'You do not have permission to view this property.';
        } else {
          this.error = 'Failed to fetch property details';
        }
        this.loading = false;
        return;
      }
      this.property = await res.json();
      this.loading = false;
    } catch (err: any) {
      this.error = err.message || 'Error fetching property details';
      this.loading = false;
    }
  }

  async fetchPropertyImages() {
    try {
      const res = await fetch(`https://localhost:7152/api/property/${this.propertyId}/images`);
      if (!res.ok) throw new Error('Failed to fetch property images');
      const imageObjs = await res.json();
      this.images = (imageObjs || []).map((img: any) =>
        img.imagePath.startsWith('http') ? img.imagePath : `https://localhost:7152${img.imagePath}`
      );
      this.currentImageIndex = 0;
    } catch (err) {
      this.images = [];
    }
  }
}
