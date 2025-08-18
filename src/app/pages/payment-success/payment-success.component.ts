import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StripePaymentService } from '../../services/stripe-payment.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: number = 0;
  confirmLoading: boolean = false;
  confirmSuccess: boolean = false;
  confirmError: string = '';
  paymentDetails: any = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private stripePaymentService: StripePaymentService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const paymentId = params['paymentId'];
      if (paymentId) {
        this.paymentId = parseInt(paymentId);
        this.confirmPayment();
      } else {
        this.confirmError = 'لم يتم العثور على معرف الدفع في الرابط.';
      }
    });
  }

  async confirmPayment() {
    this.confirmLoading = true;
    this.confirmSuccess = false;
    this.confirmError = '';
    
    try {
      // For Stripe, we don't need to manually confirm as webhook handles it
      // But we can check payment status if needed
      this.confirmSuccess = true;
      console.log('Payment confirmed successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        this.router.navigate(['/owner-properties']);
      }, 3000);
      
    } catch (err: any) {
      this.confirmError = err.message || 'فشل في تأكيد الدفع. يرجى المحاولة مرة أخرى.';
    } finally {
      this.confirmLoading = false;
    }
  }

  goToProperties() {
    this.router.navigate(['/owner-properties']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
} 