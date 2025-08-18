using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEMSARK.Data;
using SEMSARK.DTOS.PaymentDTO;
using SEMSARK.Models;
using SEMSARK.Services.Payment;

namespace SEMSARK.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly PaymobService _paymobService;
        private readonly int _iframeId = 941402;

        private const double AdvertiseCommissionRate = 0.05;
        private const double BookingCommissionRate = 0.05;

        public PaymentController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, PaymobService paymobService)
        {
            _context = context;
            _userManager = userManager;
            _paymobService = paymobService;
        }

        [HttpPost("advertise")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> CreateAdvertisePayment([FromBody] CreateAdvertisePaymentDTO dto)
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.FindByIdAsync(userId);

            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null || property.UserId != userId)
                return BadRequest("Invalid property or not yours.");

            if (property.IsPaid)
                return BadRequest("This property has already been paid for.");

            double commission = property.Price * AdvertiseCommissionRate;

            var payment = new Payment
            {
                Amount = property.Price,
                Commission = commission,
                PropertyId = property.Id,
                OwnerId = userId,
                PaymentType = "Advertise",
                Status = "Pending",
                IsConfirmed = false,
                TransactionId = null
            };

            _context.Payments.Add(payment);

            property.IsPaid = false;
            property.Status = "Pending";

            await _context.SaveChangesAsync();

            // أضف redirectUrl هنا
            var authToken = await _paymobService.GetAuthTokenAsync();
            var redirectUrl = "http://localhost:4200/payment-callback";
            var orderId = await _paymobService.CreateOrderAsync(authToken, (int)(property.Price * 100), "EGP", redirectUrl);
            var paymentKey = await _paymobService.GetPaymentKeyAsync(
                authToken,
                orderId.Value,
                (int)(property.Price * 100),
                user.Email,
                user.UserName ?? "Client"
            );
            var iframeUrl = $"https://accept.paymob.com/api/acceptance/iframes/{_iframeId}?payment_token={paymentKey}";

            return Ok(new
            {
                Message = "Payment initiated. Please proceed to payment to publish the property.",
                PaymentId = payment.Id,
                Commission = payment.Commission,
                iframeUrl = iframeUrl // بحرف صغير i
            });
        }

        [HttpPost("booking")]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> CreateBookingPayment([FromBody] CreateBookingPaymentDTO dto)
        {
            var userId = _userManager.GetUserId(User);

            var booking = await _context.Bookings
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId && b.RenterId == userId);

            if (booking == null)
                return NotFound("Booking not found or not yours.");

            if (booking.Status != "Pending")
                return BadRequest("Payment already made or booking is not in pending state.");

            var totalDays = (booking.EndDate - booking.StartDate).TotalDays;
            var amount = booking.Property.Price * totalDays;
            var commission = amount * BookingCommissionRate;

            var payment = new Payment
            {
                Amount = amount,
                Commission = commission,
                BookingId = booking.Id,
                RenterId = userId,
                OwnerId = booking.Property.UserId,
                PaymentType = "Booking",
                Status = "Pending",
                IsConfirmed = false,
                TransactionId = null
            };

            _context.Payments.Add(payment);

            // ❌ متعملش approve دلوقتي
            // ✅ هيتم في paymob-confirm بعد الدفع

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Booking payment initiated. Please proceed to payment.",
                PaymentId = payment.Id,
                TotalAmount = amount,
                Commission = commission
            });
        }

        [HttpGet("my-payments")]
        [Authorize]
        public async Task<IActionResult> GetMyPayments()
        {
            var userId = _userManager.GetUserId(User);

            var payments = await _context.Payments
                .Include(p => p.Property)
                .Where(p => p.OwnerId == userId || p.RenterId == userId)
                .OrderByDescending(p => p.DateTime)
                .Select(p => new PaymentHistoryDTO
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    Commission = p.Commission,
                    PaymentType = p.PaymentType,
                    Status = p.Status,
                    DateTime = p.DateTime,
                    PropertyId = p.PropertyId,
                    PropertyTitle = p.Property != null ? p.Property.Title : null,
                    BookingId = p.BookingId
                })
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPost("paymob-initiate")]
        [Authorize]
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequestDTO dto)
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return Unauthorized();

            var authToken = await _paymobService.GetAuthTokenAsync();
            if (authToken == null)
                return StatusCode(500, "Failed to authenticate with Paymob.");

            var orderId = await _paymobService.CreateOrderAsync(authToken, dto.AmountCents);
            if (orderId == null)
                return StatusCode(500, "Failed to create order in Paymob.");

            var paymentKey = await _paymobService.GetPaymentKeyAsync(
                authToken,
                orderId.Value,
                dto.AmountCents,
                user.Email,
                user.UserName ?? "Client"
            );

            if (paymentKey == null)
                return StatusCode(500, "Failed to generate payment key.");

            return Ok(new
            {
                PaymentKey = paymentKey,
                IframeUrl = $"https://accept.paymob.com/api/acceptance/iframes/{_iframeId}?payment_token={paymentKey}"
            });
        }

        [HttpPost("paymob-callback")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymobCallback()
        {
            return await ProcessPaymobCallback();
        }

        [HttpGet("paymob-callback")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymobCallbackGet()
        {
            return await ProcessPaymobCallback();
        }

        private async Task<IActionResult> ProcessPaymobCallback()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var body = await reader.ReadToEndAsync();

                Console.WriteLine("Paymob Callback Received:");
                Console.WriteLine(body);

                // Parse the callback data
                var queryParams = Request.Query;
                var transactionId = queryParams["id"].ToString();
                var success = queryParams["success"].ToString();
                var amountCents = queryParams["amount_cents"].ToString();
                var orderId = queryParams["order"].ToString();

                Console.WriteLine($"Transaction ID: {transactionId}");
                Console.WriteLine($"Success: {success}");
                Console.WriteLine($"Amount: {amountCents}");
                Console.WriteLine($"Order ID: {orderId}");

                if (success == "true" && !string.IsNullOrEmpty(transactionId))
                {
                    // Find the pending payment
                    var payment = await _context.Payments
                        .Where(p => p.Status == "Pending" && p.TransactionId == null)
                        .OrderByDescending(p => p.DateTime)
                        .FirstOrDefaultAsync();

                    if (payment != null)
                    {
                        // Update payment status
                        payment.Status = "Paid";
                        payment.IsConfirmed = true;
                        payment.TransactionId = transactionId;

                        // Update booking if it's a booking payment
                        if (payment.BookingId.HasValue)
                        {
                            var booking = await _context.Bookings.FindAsync(payment.BookingId.Value);
                            if (booking != null)
                            {
                                booking.Status = "Approved";
                                Console.WriteLine($"Booking {booking.Id} approved successfully");
                            }
                        }

                        // Update property if it's an advertise payment
                        if (payment.PropertyId.HasValue)
                        {
                            var property = await _context.Properties.FindAsync(payment.PropertyId.Value);
                            if (property != null)
                            {
                                property.IsPaid = true;
                                property.Status = "Available";
                                Console.WriteLine($"Property {property.Id} marked as available");
                            }
                        }

                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Payment {payment.Id} confirmed successfully");
                    }
                    else
                    {
                        Console.WriteLine("No pending payment found");
                    }
                }
                else
                {
                    Console.WriteLine("Payment was not successful");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PaymobCallback: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("paymob-confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmPaymobPayment([FromBody] string transactionId)
        {
            try
            {
                // 1. التحقق من صحة الـ transaction ID
                if (string.IsNullOrEmpty(transactionId))
                {
                    return BadRequest("Transaction ID is required");
                }

                // 2. التحقق من حالة الدفع في Paymob
                var isSuccess = await _paymobService.GetTransactionStatusAsync(transactionId);
                if (!isSuccess)
                {
                    return BadRequest("Payment failed or not completed.");
                }

                // 3. البحث عن الدفع المعلق
                var payment = await _context.Payments
                    .Where(p => p.Status == "Pending" && p.TransactionId == null)
                    .OrderByDescending(p => p.DateTime)
                    .FirstOrDefaultAsync();

                if (payment == null)
                {
                    return NotFound("No pending payment found.");
                }

                // 4. تحديث حالة الدفع
                payment.Status = "Paid";
                payment.IsConfirmed = true;
                payment.TransactionId = transactionId;

                // 5. تحديث حالة الحجز إذا كان دفع حجز
                if (payment.BookingId.HasValue)
                {
                    var booking = await _context.Bookings.FindAsync(payment.BookingId.Value);
                    if (booking != null)
                    {
                        booking.Status = "Approved";
                    }
                }

                // 6. تحديث حالة العقار إذا كان دفع إعلان
                if (payment.PropertyId.HasValue)
                {
                    var property = await _context.Properties.FindAsync(payment.PropertyId.Value);
                    if (property != null)
                    {
                        property.IsPaid = true;
                        property.Status = "Available";
                    }
                }

                // 7. حفظ التغييرات
                await _context.SaveChangesAsync();

                // 8. إرجاع رسالة نجاح
                return Ok(new
                {
                    Message = "Payment confirmed and saved successfully.",
                    TransactionId = transactionId,
                    PaymentId = payment.Id,
                    PaymentType = payment.PaymentType
                });
            }
            catch (Exception ex)
            {
                // تسجيل الخطأ للـ debugging
                Console.WriteLine($"Error in ConfirmPaymobPayment: {ex.Message}");
                return StatusCode(500, "Internal server error occurred while confirming payment.");
            }
        }
    }
} 