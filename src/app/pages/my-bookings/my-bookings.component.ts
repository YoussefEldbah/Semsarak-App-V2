import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface Booking {
  id: number;
  propertyId: number;
  propertyTitle: string;
  city: string;
  region: string;
  roomsCount: number;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  imageUrls: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error: string = '';
  isRenter: boolean = false;
  cancellingId: number | null = null;
  cancelError: string = '';
  cancelSuccess: string = '';
  payingId: number | null = null;
  paymentError: string = '';
  paymentSuccess: string = '';

  private stripe: Stripe | null = null;

  ngOnInit() {
    // Check if user is renter
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
    if (this.isRenter) {
      this.fetchBookings();
    } else {
      this.loading = false;
      this.error = 'This page is for renters only.';
    }
  }

  async fetchBookings() {
    this.loading = true;
    this.error = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('https://localhost:7152/api/booking/my-bookings', {
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
      });
      const data = await res.json();
      console.log('My Bookings API response:', data);
      if (!res.ok) {
        this.error = data?.message || 'Failed to fetch bookings.';
        this.bookings = [];
      } else {
        this.bookings = data;
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to fetch bookings.';
      this.bookings = [];
    } finally {
      this.loading = false;
    }
  }

  async cancelBooking(booking: Booking) {
    if (!booking || !booking.id) return;
    this.cancellingId = booking.id;
    this.cancelError = '';
    this.cancelSuccess = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`https://localhost:7152/api/booking/${booking.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        }
      });
      const responseText = await res.text();
      let responseJson: any = {};
      try { responseJson = JSON.parse(responseText); } catch { responseJson = responseText; }
      console.log('Cancel Booking API response:', responseJson);
      if (!res.ok) {
        this.cancelError = responseJson?.message || responseJson || 'Failed to cancel booking.';
        this.cancellingId = null;
        return;
      }
      booking.status = 'Cancelled';
      this.cancelSuccess = 'Booking cancelled successfully!';
      setTimeout(() => { this.cancelSuccess = ''; }, 4000);
    } catch (err: any) {
      this.cancelError = err.message || 'Failed to cancel booking.';
    } finally {
      this.cancellingId = null;
    }
  }

  canCancel(booking: Booking): boolean {
    if (!booking || !this.isRenter) return false;
    const status = booking.status;
    if (status === 'Cancelled' || status === 'Rejected') return false;
    const today = new Date();
    const endDate = new Date(booking.endDate);
    return endDate > today;
  }

  getImageUrl(path?: string): string {
    if (!path) return 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=No+Image';
    if (path.startsWith('http')) return path;
    return `https://localhost:7152${path}`;
  }

  async payForBooking(booking: Booking) {
    if (!booking || !booking.id) return;

    this.payingId = booking.id;
    this.paymentError = '';
    this.paymentSuccess = '';

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`https://localhost:7152/api/booking/${booking.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        }
      });

      const data = await res.json();
      console.log('Pay for Booking API response:', data);

      if (!res.ok) {
        this.paymentError = data?.message || 'Failed to initiate payment';
        return;
      }

      // Create checkout session
      const checkoutRes = await fetch('https://localhost:7152/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          paymentId: data.paymentId,
          title: `Booking Payment: ${booking.propertyTitle}`,
          returnUrl: window.location.origin + '/my-bookings'
        })
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        this.paymentError = checkoutData?.error || 'Failed to create checkout session';
        return;
      }

      // Load Stripe and redirect to checkout
      this.stripe = await loadStripe(data.publishableKey);
      if (!this.stripe) {
        this.paymentError = 'Failed to load Stripe';
        return;
      }

      // Redirect to Stripe Checkout using sessionUrl
      window.location.href = checkoutData.sessionUrl;

    } catch (err: any) {
      this.paymentError = err.message || 'Failed to initiate payment';
    } finally {
      this.payingId = null;
    }
  }

  canPay(booking: Booking): boolean {
    if (!booking || !this.isRenter) return false;
    return booking.status === 'Pending';
  }



  getStatusText(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Pending Payment';
      case 'Approved':
        return 'Confirmed';
      case 'Cancelled':
        return 'Cancelled';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  }
}
