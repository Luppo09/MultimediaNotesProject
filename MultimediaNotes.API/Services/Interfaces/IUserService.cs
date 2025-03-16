using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;

namespace MultimediaNotes.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDTO>> GetAllUsers();
        Task<IEnumerable<UserDTO>> GetUsersWithAnnotations();
        Task<UserDTO> GetUserById(int id);
        Task CreateUser(UserDTO userDTO);
        Task UpdateUser(UserDTO userDTO);
        Task DeleteUser(int id);
    }
}
