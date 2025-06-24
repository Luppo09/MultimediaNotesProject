using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.DTOs.Mappings;
using MultimediaNotes.API.Models.Repositories;
using MultimediaNotes.API.Models.Repositories.Interfaces;
using MultimediaNotes.API.Services;
using MultimediaNotes.API.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco de dados MySQL
var mySqlConnection = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
                 options.UseMySql(mySqlConnection,
                 ServerVersion.AutoDetect(mySqlConnection)));

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    { 
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    });

// Correct Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Adding the mapping profile
builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAnnotationRepository, AnnotationRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAnnotationService, AnnotationService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API v1");
        options.RoutePrefix = string.Empty; // Define Swagger como página inicial
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();