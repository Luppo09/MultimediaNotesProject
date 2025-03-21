using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.DTOs;
using AutoMapper;
using MultimediaNotes.API.Services.Interfaces;

namespace MultimediaNotes.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll()
        {
            var usersDTO = await _userService.GetAllUsers();
            if (usersDTO == null)
            {
                return NotFound("Users not found");
            }
            return Ok(usersDTO);
        }

        [HttpGet("annotations")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsersAnnotations()
        {
            var usersDTO = await _userService.GetUsersWithAnnotations();
            if (usersDTO == null)
            {
                return NotFound("Users not found");
            }
            return Ok(usersDTO);
        }

        // GET: api/User/5
        [HttpGet("{id:int}", Name = "GetUser")]
        public async Task<ActionResult<UserDTO>> Get(int id)
        {
            var userDTO = await _userService.GetUserById(id);
            if (userDTO == null)
            {
                return NotFound("User not found");
            }
            return Ok(userDTO);
        }

        /*[HttpGet("WithAnnotations")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsersWithAnnotations()
        {
            // Carregar usuários com suas anotações
            var users = await _context.Users
                .Include(u => u.Annotations)
                .ToListAsync();

            // Mapear para DTO sem criar referências circulares
            var userDtos = users.Select(u => new UserDTO
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                // Não incluir o hash da senha por razões de segurança
                Annotations = u.Annotations.Select(a => new AnnotationDTO
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    Category = a.Category,
                    Priority = a.Priority,
                    Reminder = a.Reminder,
                    UserId = u.Id
                    // Importante: NÃO inclua a referência ao User aqui
                }).ToList()
            }).ToList();

            return Ok(userDtos);
        }*/

        // PUT: api/User/5


        // POST: api/User

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] UserDTO userDTO)
        {
            if (userDTO == null)
                return BadRequest("Invalid Data");

            await _userService.CreateUser(userDTO);

            return new CreatedAtRouteResult(
            "GetUser",
            new { id = userDTO.Id },
            userDTO);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Put(int id, [FromBody] UserDTO userDTO)
        {
            if (userDTO == null)
            {
                return BadRequest();
            }

            if (id != userDTO.Id)
            {
                return BadRequest();
            }

            await _userService.UpdateUser(userDTO);

            return Ok(userDTO);
        }

        // DELETE: api/User/5
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<UserDTO>> Delete(int id)
        {
            var userDTO = await _userService.GetUserById(id);
            if (userDTO == null)
            {
                return NotFound("User not found");
            }

            await _userService.DeleteUser(id);

            return Ok(userDTO);
        }
    }
}
