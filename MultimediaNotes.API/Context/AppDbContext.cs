using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Models;

namespace MultimediaNotes.API.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Annotation> Annotations { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuração da tabela Usuario
            modelBuilder.Entity<User>().HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .Property(u => u.Name)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(150)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            modelBuilder.Entity<User>()
                .ToTable("Users");

            // Configuração da tabela Anotacao
            modelBuilder.Entity<Annotation>().HasKey(a => a.Id);

            modelBuilder.Entity<Annotation>()
                .Property(a => a.Title)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Annotation>()
                .Property(a => a.Content)
                .IsRequired();

            modelBuilder.Entity<Annotation>()
                .Property(a => a.Category)
                .HasMaxLength(50);

            modelBuilder.Entity<Annotation>()
                .Property(a => a.Priority)
                .HasDefaultValue(1); // Default prority  = 1 (Low)

            modelBuilder.Entity<Annotation>()
                .HasOne(a => a.User)
                .WithMany(u => u.Annotations)
                .HasForeignKey(a => a.UserId) 
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Annotation>()
                .ToTable("Annotations");

            // Dados iniciais (sem BCrypt dinâmico)
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Name = "Admin", Email = "admin@email.com", PasswordHash = "$2a$10$saltofakehash" }
            );
        }
    }
}
