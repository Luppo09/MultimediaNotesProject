using MultimediaNotes.API.Models;
using System.Security.Claims;

namespace MultimediaNotes.API.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
