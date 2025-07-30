using Microsoft.AspNetCore.Identity;
using MultimediaNotes.API.DTOs;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IJwtService _jwtService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IJwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginDto)
        {
            try
            {
                // Buscar usuário por email
                var user = await _userManager.FindByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email ou senha inválidos"
                    };
                }

                // Verificar senha usando Identity
                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email ou senha inválidos"
                    };
                }

                // Gerar token JWT
                var token = _jwtService.GenerateToken(user);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Login realizado com sucesso",
                    Token = token,
                    User = new UserDTO
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email!
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                };
            }
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerDto)
        {
            try
            {
                // Verificar se o email já existe
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Este email já está em uso"
                    };
                }

                // Criar novo usuário
                var newUser = new User
                {
                    Name = registerDto.Name,
                    Email = registerDto.Email,
                    UserName = registerDto.Email 
                };

                // Criar usuário usando Identity
                var result = await _userManager.CreateAsync(newUser, registerDto.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = $"Erro ao criar usuário: {errors}"
                    };
                }

                // Gerar token JWT
                var token = _jwtService.GenerateToken(newUser);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Usuário criado com sucesso",
                    Token = token,
                    User = new UserDTO
                    {
                        Id = newUser.Id,
                        Name = newUser.Name,
                        Email = newUser.Email!
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                };
            }
        }
    }
}