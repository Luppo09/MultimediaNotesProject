using AutoMapper;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Models.Repositories.Interfaces;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsers()
        {
            var usersEntity = await _userRepository.GetAllUsers();
            return _mapper.Map<IEnumerable<UserDTO>>(usersEntity);
        }

        public async Task<IEnumerable<UserDTO>> GetUsersWithAnnotations()
        {
            var usersEntity = await _userRepository.GetUsersWithAnnotations();
            return _mapper.Map<IEnumerable<UserDTO>>(usersEntity);
        }

        public async Task<UserDTO> GetUserById(int id)
        {
            var userEntity = await _userRepository.GetUserById(id);
            return _mapper.Map<UserDTO>(userEntity);
        }


        public async Task CreateUser(UserDTO userDTO)
        {
            var userEntity = _mapper.Map<User>(userDTO);
            await _userRepository.CreateUser(userEntity);
            userDTO.Id = userEntity.Id;
        }

        public async Task UpdateUser(UserDTO userDTO)
        {
            var userEntity = _mapper.Map<User>(userDTO);
            await _userRepository.UpdateUser(userEntity);
        }

        public async Task DeleteUser(int id)
        {
            var userEntity = _userRepository.GetUserById(id).Result;
            await _userRepository.DeleteUser(userEntity.Id);

        }

    }
}
