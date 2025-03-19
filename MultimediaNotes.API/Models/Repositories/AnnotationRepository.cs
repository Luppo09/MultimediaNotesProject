using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Models.Repositories.Interfaces;

namespace MultimediaNotes.API.Models.Repositories
{
    public class AnnotationRepository : IAnnotationRepository
    {
        private readonly AppDbContext _context;

        public AnnotationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Annotation>> GetAllAnotations()
        {
            return await _context.Annotations.Include(c => c.User).ToListAsync();
        }

        public async Task<IEnumerable<Annotation>> GetAnnotationsByUserId(int userId)
        {
            return await _context.Annotations.Where(c => c.UserId == userId).ToListAsync();
        }

        public async Task<Annotation> GetAnnotationById(int id)
        {
            return await _context.Annotations.Include(c => c.User).Where(p => p.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<Annotation> CreateAnnotation(Annotation annotation)
        {
            _context.Annotations.Add(annotation);
            await _context.SaveChangesAsync();
            return annotation;
        }

        public async Task<Annotation> UpdateAnnotation(Annotation annotation)
        {
            _context.Entry(annotation).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return annotation;
        }

        public async Task<Annotation> DeleteAnnotation(int id)
        {
            var annotation = await GetAnnotationById(id);
            _context.Annotations.Remove(annotation);
            await _context.SaveChangesAsync();
            return annotation;
        }
    }
}
