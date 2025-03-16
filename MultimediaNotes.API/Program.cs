using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.DTOs.Mappings;

var builder = WebApplication.CreateBuilder(args);

// Configura��o do banco de dados MySQL
var mySqlConnection = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
                 options.UseMySql(mySqlConnection,
                 ServerVersion.AutoDetect(mySqlConnection)));

// Add services to the container.
builder.Services.AddControllers();

// Correct Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Adding the mapping profile
builder.Services.AddAutoMapper(typeof(MappingProfile)); 


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API v1");
        options.RoutePrefix = string.Empty; // Define Swagger como p�gina inicial
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();