import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripePaymentService, PaymentIntentResponse } from '../../services/stripe-payment.service';
import { loadStripe, Stripe, StripeElements, StripeElement, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stripe-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-credit-card text-primary me-2"></i>
            {{ title }}
          </h5>
          <button type="button" class="btn-close" (click)="closeModal()"></button>
        </div>
        
        <div class="modal-body">
          <!-- Payment Details -->
          <div class="payment-details mb-4">
            <div class="detail-item">
              <span class="label">المبلغ الأساسي:</span>
              <span class="value">{{ amount | currency:'EGP' }}</span>
            </div>
            <div class="detail-item" *ngIf="commission">
              <span class="label">العمولة:</span>
              <span class="value">{{ commission | currency:'EGP' }}</span>
            </div>
            <div class="detail-item total">
              <span class="label">إجمالي المبلغ:</span>
              <span class="value">{{ totalAmount | currency:'EGP' }}</span>
            </div>
          </div>

          <!-- Card Input -->
          <div *ngIf="!paymentIntent && !isLoading" class="card-input-container">
            <label class="form-label">معلومات البطاقة</label>
            <div #cardElement class="card-element"></div>
            <small class="text-muted">سيتم توجيهك إلى Stripe لإتمام الدفع</small>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-container text-center">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <h6 class="text-primary">جاري إنشاء عملية الدفع...</h6>
          </div>

          <!-- Payment Intent Created -->
          <div *ngIf="paymentIntent && !isProcessing" class="payment-intent-container">
            <div class="text-center mb-3">
              <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h6 class="text-success">تم إنشاء عملية الدفع</h6>
              <p class="text-muted small">سيتم تحويلك إلى Stripe لإتمام الدفع</p>
            </div>
          </div>

          <!-- Processing Payment -->
          <div *ngIf="isProcessing" class="processing-container text-center">
            <div class="spinner-border text-success mb-3" role="status">
              <span class="visually-hidden">Processing...</span>
            </div>
            <h6 class="text-success">جاري معالجة الدفع...</h6>
            <p class="text-muted small">سيتم تحويلك إلى Stripe</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="error-container text-center">
            <div class="text-danger mb-2">
              <i class="fas fa-exclamation-triangle fa-2x"></i>
            </div>
            <p class="text-danger small">{{ error }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            *ngIf="!paymentIntent && !isLoading" 
            type="button" 
            class="btn btn-primary" 
            (click)="initiatePayment()"
            [disabled]="isLoading">
            <i class="fas fa-credit-card me-2"></i>
            {{ isLoading ? 'جاري التحميل...' : 'إتمام الدفع' }}
          </button>
          
          <button 
            *ngIf="paymentIntent && !isProcessing" 
            type="button" 
            class="btn btn-success" 
            (click)="processPayment()">
            <i class="fas fa-lock me-2"></i>
            إتمام الدفع الآمن
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="closeModal()"
            [disabled]="isProcessing">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .modal-content {
      background: white;
      border-radius: 15px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid #dee2e6;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
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

    .detail-item.total {
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

    .card-input-container {
      margin-bottom: 1rem;
    }

    .card-element {
      border: 1px solid #ced4da;
      border-radius: 8px;
      padding: 1rem;
      background: white;
      margin-bottom: 1rem;
    }

    .loading-container, .payment-intent-container, .processing-container, .error-container {
      text-align: center;
      padding: 2rem 1rem;
    }

    .spinner-border {
      width: 2rem;
      height: 2rem;
    }

    .btn {
      padding: 0.5rem 1rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }

    .btn-close:hover {
      color: #000;
    }
  `]
})
export class StripePaymentModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'إتمام الدفع';
  @Input() amount: number = 0;
  @Input() commission: number = 0;
  @Input() paymentType: 'advertise' | 'booking' = 'advertise';
  @Input() propertyId?: number;
  @Input() bookingId?: number;
  
  @Output() modalClosed = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<string>();

  @ViewChild('cardElement', { static: false }) cardElementRef!: ElementRef;

  isLoading: boolean = false;
  isProcessing: boolean = false;
  paymentIntent: PaymentIntentResponse | null = null;
  error: string = '';
  
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor(private stripePaymentService: StripePaymentService) {}

  async ngOnInit() {
    await this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await loadStripe(environment.stripe.publishableKey);
      if (this.stripe) {
        this.elements = this.stripe.elements();
        console.log('Stripe Elements initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Stripe Elements:', error);
    }
  }

  async ngAfterViewInit() {
    if (this.elements && this.cardElementRef) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });
      
      this.cardElement.mount(this.cardElementRef.nativeElement);
    }
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
      
      console.log('Creating Stripe checkout session...');
      console.log('Request body:', {
        paymentId: this.paymentIntent.paymentId.toString(),
        title: this.title,
        returnUrl: returnUrl
      });
      
      // Create checkout session through backend
      const response = await fetch(`${environment.apiUrl}/api/Payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          paymentId: this.paymentIntent.paymentId.toString(),
          title: this.title,
          returnUrl: returnUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionUrl } = await response.json();
      
      console.log('Redirecting to Stripe checkout:', sessionUrl);
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
      
    } catch (error: any) {
      this.isProcessing = false;
      this.error = error.message || 'حدث خطأ في معالجة الدفع';
      this.paymentError.emit(this.error);
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  }

  closeModal() {
    this.isVisible = false;
    this.modalClosed.emit();
    this.resetModal();
  }

  private resetModal() {
    this.isLoading = false;
    this.isProcessing = false;
    this.paymentIntent = null;
    this.error = '';
  }

  get totalAmount(): number {
    return this.amount + this.commission;
  }
}
