using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public UserService(UserManager<User> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            return _mapper.Map<IEnumerable<UserDTO>>(users);
        }

        public async Task<IEnumerable<UserDTO>> GetUsersWithAnnotations()
        {
            var users = await _userManager.Users
                .Include(u => u.Annotations)
                .ToListAsync();
            return _mapper.Map<IEnumerable<UserDTO>>(users);
        }

        public async Task<UserDTO> GetUserById(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            return _mapper.Map<UserDTO>(user);
        }

        public async Task CreateUser(UserDTO userDTO)
        {
            
            var user = new User
            {
                Name = userDTO.Name,
                Email = userDTO.Email,
                UserName = userDTO.Email
            };

            
            var tempPassword = "TempPassword123!";
            var result = await _userManager.CreateAsync(user, tempPassword);

            if (result.Succeeded)
            {
                userDTO.Id = user.Id;
            }
        }

        public async Task UpdateUser(UserDTO userDTO)
        {
            var user = await _userManager.FindByIdAsync(userDTO.Id.ToString());
            if (user != null)
            {
                user.Name = userDTO.Name;
                user.Email = userDTO.Email;
                user.UserName = userDTO.Email;

                await _userManager.UpdateAsync(user);
            }
        }

        public async Task DeleteUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user != null)
            {
                await _userManager.DeleteAsync(user);
            }
        }
    }
}