using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEMSARK.Data;
using SEMSARK.Models;

namespace SEMSARK.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public PropertyController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetProperties()
        {
            var properties = await _context.Properties
                .Include(p => p.User)
                .Where(p => p.Status == "Available")
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(properties);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProperty(int id)
        {
            var property = await _context.Properties
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property == null)
                return NotFound();

            return Ok(property);
        }

        [HttpGet("my-properties")]
        [Authorize]
        public async Task<IActionResult> GetMyProperties()
        {
            var userId = _userManager.GetUserId(User);
            var properties = await _context.Properties
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(properties);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProperty([FromBody] Property propertyDto)
        {
            var userId = _userManager.GetUserId(User);
            
            var property = new Property
            {
                Title = propertyDto.Title,
                Description = propertyDto.Description,
                Price = propertyDto.Price,
                City = propertyDto.City,
                Address = propertyDto.Address,
                Type = propertyDto.Type,
                Status = "Pending", // Will be Available after payment
                IsPaid = false,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return Ok(new { id = property.Id, message = "Property created successfully" });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProperty(int id, [FromBody] Property propertyDto)
        {
            var userId = _userManager.GetUserId(User);
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (property == null)
                return NotFound("Property not found or you don't have permission to edit it.");

            property.Title = propertyDto.Title;
            property.Description = propertyDto.Description;
            property.Price = propertyDto.Price;
            property.City = propertyDto.City;
            property.Address = propertyDto.Address;
            property.Type = propertyDto.Type;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Property updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            try
            {
                var userId = _userManager.GetUserId(User);
                var property = await _context.Properties
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

                if (property == null)
                    return NotFound("Property not found or you don't have permission to delete it.");

                // Check for active bookings
                var activeBookings = await _context.Bookings
                    .Where(b => b.PropertyId == id && (b.Status == "Pending" || b.Status == "Approved"))
                    .ToListAsync();

                if (activeBookings.Any())
                {
                    return BadRequest("Cannot delete property: It has active bookings.");
                }

                // Check for pending payments
                var pendingPayments = await _context.Payments
                    .Where(p => p.PropertyId == id && p.Status == "Pending")
                    .ToListAsync();

                if (pendingPayments.Any())
                {
                    return BadRequest("Cannot delete property: It has pending payments.");
                }

                // 1. Delete property images first
                var propertyImages = await _context.PropertyImages
                    .Where(pi => pi.PropertyId == id)
                    .ToListAsync();

                if (propertyImages.Any())
                {
                    _context.PropertyImages.RemoveRange(propertyImages);
                    await _context.SaveChangesAsync(); // Save immediately
                }

                // 2. Delete ALL payments related to this property (including completed ones)
                var allPayments = await _context.Payments
                    .Where(p => p.PropertyId == id)
                    .ToListAsync();

                if (allPayments.Any())
                {
                    _context.Payments.RemoveRange(allPayments);
                    await _context.SaveChangesAsync(); // Save immediately
                }

                // 3. Delete completed bookings (if any)
                var completedBookings = await _context.Bookings
                    .Where(b => b.PropertyId == id && b.Status == "Completed")
                    .ToListAsync();

                if (completedBookings.Any())
                {
                    _context.Bookings.RemoveRange(completedBookings);
                    await _context.SaveChangesAsync(); // Save immediately
                }

                // 4. Finally delete the property
                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Property deleted successfully" });
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error deleting property {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}