using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SEMSARK.Data;
using SEMSARK.Models;
using SEMSARK.DTOS;
using SEMSARK.DTOS.PropertyDTOS;

namespace SEMSARK.Controllers.PorpretyControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly ApplicationDbContext context;
        private readonly UserManager<ApplicationUser> userManager;

        public PropertyController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            this.context = context;
            this.userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                RoomsCount = dto.RoomsCount,
                GenderPreference = dto.GenderPreference,
                City = dto.City,
                Region = dto.Region,
                Street = dto.Street,
                Status = "Pending",  //  لازم كده علشان نستنى البايمنت
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            context.Properties.Add(property);
            await context.SaveChangesAsync();
            return Ok(property);
        }

        // ✅ Endpoint جديد: عقارات الأونر الحالي فقط
        [HttpGet("my-properties")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyProperties()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var myProperties = await context.Properties
                .Where(p => p.UserId == userId)
                .Include(p => p.PropertyImages)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    City = p.City,
                    Region = p.Region,
                    Status = p.Status,
                    ImagePaths = p.PropertyImages.Select(img => img.ImagePath).ToList()
                })
                .ToListAsync();

            return Ok(myProperties);
        }

        [HttpGet]
        [Authorize(Roles = "Renter")]
        public async Task<IActionResult> GetAllProperties()
        {
            var properties = await context.Properties
                .Where(p => p.Status == "Available") //  هنا بنفلتر اللي ظاهر للمستأجرين => الشقق المتاحه فقط
                .Include(p => p.PropertyImages)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Price = p.Price,
                    City = p.City,
                    Region = p.Region,

                    Status = p.Status,
                    ImagePaths = p.PropertyImages.Select(img => img.ImagePath).ToList()
                })
                .ToListAsync();

            return Ok(properties);
        }

        //yousef eldbah
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var property = await context.Properties
                .Include(p => p.PropertyImages)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property == null)
            {
                return NotFound(new { Message = "Property not found" });
            }

            var dto = new PropertyDetailsDto
            {
                Id = property.Id,
                Title = property.Title,
                Description = property.Description,
                Price = property.Price,
                RoomsCount = property.RoomsCount,
                GenderPreference = property.GenderPreference,
                City = property.City,
                Region = property.Region,
                Street = property.Street,
                Status = property.Status,
                CreatedAt = property.CreatedAt,
                OwnerName = property.User?.UserName,
                ImageUrls = property.PropertyImages.Select(img => img.ImagePath).ToList()
            };

            return Ok(dto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> UpdateProperty(int id, [FromBody] UpdatePropertyDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var property = await context.Properties.FirstOrDefaultAsync(p => p.Id == id);

            if (property == null)
            {
                return NotFound("Property not found");
            }

            if (property.UserId != userId)
                return Forbid("You are not allowed to edit this property");

            property.Title = dto.Title;
            property.Description = dto.Description;
            property.Price = dto.Price;
            property.RoomsCount = dto.RoomsCount;
            property.GenderPreference = dto.GenderPreference;
            property.City = dto.City;
            property.Region = dto.Region;
            property.Street = dto.Street;
            context.Properties.Update(property);
            await context.SaveChangesAsync();

            return Ok(property);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                var property = await context.Properties
                    .Include(p => p.PropertyImages)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (property == null)
                    return NotFound("Property not found");

                if (property.UserId != userId)
                    return Forbid("You are not allowed to delete this property");

                // Check for active bookings
                var activeBookings = await context.Bookings
                    .Where(b => b.PropertyId == id && (b.Status == "Pending" || b.Status == "Approved"))
                    .ToListAsync();

                if (activeBookings.Any())
                {
                    return BadRequest("Cannot delete property: It has active bookings.");
                }

                // Check for pending payments
                var pendingPayments = await context.Payments
                    .Where(p => p.PropertyId == id && p.Status == "Pending")
                    .ToListAsync();

                if (pendingPayments.Any())
                {
                    return BadRequest("Cannot delete property: It has pending payments.");
                }

                // 1. Delete property images first
                if (property.PropertyImages.Any())
                {
                    context.PropertyImages.RemoveRange(property.PropertyImages);
                    await context.SaveChangesAsync(); // Save immediately
                }

                // 2. Delete ALL payments related to this property
                var allPayments = await context.Payments
                    .Where(p => p.PropertyId == id)
                    .ToListAsync();

                if (allPayments.Any())
                {
                    context.Payments.RemoveRange(allPayments);
                    await context.SaveChangesAsync(); // Save immediately
                }

                // 3. Delete completed bookings (if any)
                var completedBookings = await context.Bookings
                    .Where(b => b.PropertyId == id && b.Status == "Completed")
                    .ToListAsync();

                if (completedBookings.Any())
                {
                    context.Bookings.RemoveRange(completedBookings);
                    await context.SaveChangesAsync(); // Save immediately
                }

                // 4. Finally delete the property
                context.Properties.Remove(property);
                await context.SaveChangesAsync();

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