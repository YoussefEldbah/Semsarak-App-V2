import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  message: string;
  paymentId: number;
  commission?: number;
  totalAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {
  private stripe: Stripe | null = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await loadStripe(environment.stripe.publishableKey);
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  async createAdvertisePayment(propertyId: number): Promise<PaymentIntentResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${environment.apiUrl}/api/Payment/advertise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating advertise payment:', error);
      throw error;
    }
  }

  async createBookingPayment(bookingId: number): Promise<PaymentIntentResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${environment.apiUrl}/api/Payment/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating booking payment:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, returnUrl: string): Promise<{ error?: any }> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await this.stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      return { error };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { error };
    }
  }

  async confirmPaymentWithCard(clientSecret: string, elements: StripeElements, returnUrl: string): Promise<{ error?: any }> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await this.stripe.confirmPayment({
        elements: elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      return { error };
    } catch (error) {
      console.error('Error confirming payment with card:', error);
      return { error };
    }
  }

  async confirmPaymentManually(paymentIntentId: string): Promise<any> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${environment.apiUrl}/api/Payment/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentIntentId)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to confirm payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment manually:', error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  }
}
