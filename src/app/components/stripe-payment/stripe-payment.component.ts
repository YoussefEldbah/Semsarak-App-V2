import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripePaymentService, PaymentIntentResponse } from '../../services/stripe-payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-container">
      <!-- Payment Form -->
      <div *ngIf="!paymentIntent && !isLoading" class="payment-form">
        <h3 class="text-center mb-4">{{ title }}</h3>
        
        <div class="amount-display mb-4">
          <div class="amount-item">
            <span class="label">المبلغ الأساسي:</span>
            <span class="value">{{ amount | currency:'EGP' }}</span>
          </div>
          <div class="amount-item" *ngIf="commission">
            <span class="label">العمولة:</span>
            <span class="value">{{ commission | currency:'EGP' }}</span>
          </div>
          <div class="amount-item total">
            <span class="label">إجمالي المبلغ:</span>
            <span class="value">{{ totalAmount | currency:'EGP' }}</span>
          </div>
        </div>

        <div class="d-grid">
          <button 
            class="btn btn-primary btn-lg" 
            (click)="initiatePayment()"
            [disabled]="isLoading">
            <i class="fas fa-credit-card me-2"></i>
            {{ isLoading ? 'جاري التحميل...' : 'إتمام الدفع' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h4 class="text-primary">جاري إنشاء عملية الدفع...</h4>
        <p class="text-muted">يرجى الانتظار</p>
      </div>

      <!-- Payment Intent Created -->
      <div *ngIf="paymentIntent && !isProcessing" class="payment-intent-container">
        <div class="text-center mb-4">
          <i class="fas fa-credit-card fa-3x text-primary mb-3"></i>
          <h4 class="text-primary">تم إنشاء عملية الدفع</h4>
          <p class="text-muted">سيتم تحويلك إلى صفحة الدفع</p>
        </div>
        
        <div class="payment-details mb-4">
          <div class="detail-item">
            <span class="label">معرف الدفع:</span>
            <span class="value">{{ paymentIntent.paymentId }}</span>
          </div>
          <div class="detail-item">
            <span class="label">العمولة:</span>
            <span class="value">{{ paymentIntent.commission | currency:'EGP' }}</span>
          </div>
        </div>

        <div class="d-grid">
          <button 
            class="btn btn-success btn-lg" 
            (click)="processPayment()">
            <i class="fas fa-lock me-2"></i>
            إتمام الدفع الآمن
          </button>
        </div>
      </div>

      <!-- Processing Payment -->
      <div *ngIf="isProcessing" class="processing-container text-center">
        <div class="spinner-border text-success mb-3" role="status">
          <span class="visually-hidden">Processing...</span>
        </div>
        <h4 class="text-success">جاري معالجة الدفع...</h4>
        <p class="text-muted">سيتم تحويلك إلى Stripe لإتمام الدفع</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container text-center">
        <div class="text-danger mb-3">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h4 class="text-danger">حدث خطأ</h4>
        <p class="text-muted mb-3">{{ error }}</p>
        <button class="btn btn-primary" (click)="retry()">
          <i class="fas fa-redo me-2"></i>إعادة المحاولة
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }

    .payment-form, .loading-container, .payment-intent-container, .processing-container, .error-container {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .amount-display {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
    }

    .amount-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .amount-item:last-child {
      border-bottom: none;
    }

    .amount-item.total {
      font-weight: bold;
      font-size: 1.1rem;
      color: #28a745;
      border-top: 2px solid #28a745;
      padding-top: 1rem;
      margin-top: 0.5rem;
    }

    .label {
      color: #6c757d;
    }

    .value {
      font-weight: 500;
    }

    .payment-details {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class StripePaymentComponent implements OnInit {
  @Input() title: string = 'إتمام الدفع';
  @Input() amount: number = 0;
  @Input() commission: number = 0;
  @Input() paymentType: 'advertise' | 'booking' = 'advertise';
  @Input() propertyId?: number;
  @Input() bookingId?: number;
  
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<string>();

  isLoading: boolean = false;
  isProcessing: boolean = false;
  paymentIntent: PaymentIntentResponse | null = null;
  error: string = '';

  constructor(
    private stripePaymentService: StripePaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    // Component initialization
  }

  async initiatePayment() {
    try {
      this.isLoading = true;
      this.error = '';

      let paymentResponse: PaymentIntentResponse;

      if (this.paymentType === 'advertise' && this.propertyId) {
        paymentResponse = await this.stripePaymentService.createAdvertisePayment(this.propertyId);
      } else if (this.paymentType === 'booking' && this.bookingId) {
        paymentResponse = await this.stripePaymentService.createBookingPayment(this.bookingId);
      } else {
        throw new Error('Invalid payment type or missing ID');
      }

      this.paymentIntent = paymentResponse;
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this.error = error.message || 'حدث خطأ في إنشاء عملية الدفع';
      this.paymentError.emit(this.error);
    }
  }

  async processPayment() {
    if (!this.paymentIntent) return;

    try {
      this.isProcessing = true;
      this.error = '';

      const returnUrl = `${window.location.origin}/payment-success?paymentId=${this.paymentIntent.paymentId}`;
      
      const { error } = await this.stripePaymentService.confirmPayment(
        this.paymentIntent.clientSecret,
        returnUrl
      );

      if (error) {
        throw new Error(error.message || 'فشل في معالجة الدفع');
      }

      // Payment will redirect to Stripe, so we don't need to handle success here
      this.isProcessing = false;
    } catch (error: any) {
      this.isProcessing = false;
      this.error = error.message || 'حدث خطأ في معالجة الدفع';
      this.paymentError.emit(this.error);
    }
  }

  retry() {
    this.error = '';
    this.paymentIntent = null;
    this.initiatePayment();
  }

  get totalAmount(): number {
    return this.amount + this.commission;
  }
}
