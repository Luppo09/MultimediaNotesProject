using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Repositories.Interfaces;

namespace MultimediaNotes.API.Models.Repositories
{
    public class AnnotationRepository : IAnnotationRepository
    {
        private readonly AppDbContext _context;

        public AnnotationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Annotation> GetAnnotationByIdAsync(int id)
        {
            return await _context.Annotations.Include(a => a.User).FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Annotation>> GetAnnotationsByUserIdAsync(int userId)
        {
            return await _context.Annotations.Where(a => a.UserId == userId).ToListAsync();
        }

        public async Task AddAnnotationAsync(Annotation annotation)
        {
            await _context.Annotations.AddAsync(annotation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAnnotationAsync(Annotation annotation)
        {
            _context.Annotations.Update(annotation);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAnnotationAsync(int id)
        {
            var annotation = await _context.Annotations.FindAsync(id);
            if (annotation != null)
            {
                _context.Annotations.Remove(annotation);
                await _context.SaveChangesAsync();
            }
        }
    }
}
