using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Models;

namespace MultimediaNotes.API.Context
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Annotation> Annotations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Importante: chama a configuração base do Identity

            // Configuração adicional do User (além do que o Identity já faz)
            modelBuilder.Entity<User>()
                .Property(u => u.Name)
                .HasMaxLength(100)
                .IsRequired();

            // Tabela Annotation
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
                .HasDefaultValue(1);

            modelBuilder.Entity<Annotation>()
                .HasOne(a => a.User)
                .WithMany(u => u.Annotations)
                .HasForeignKey(a => a.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Annotation>()
                .ToTable("Annotations");

            // Renomear tabelas do Identity
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
            modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        }
    }
}