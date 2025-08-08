using Microsoft.EntityFrameworkCore;
using MultimediaNotes.API.Context;
using MultimediaNotes.API.Models;
using MultimediaNotes.API.Models.Repositories.Interfaces;

namespace MultimediaNotes.API.Models.Repositories
{
    public class MediaFileRepository : IMediaFileRepository
    {
        private readonly AppDbContext _context;

        public MediaFileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MediaFile>> GetByAnnotationIdAsync(int annotationId)
        {
            return await _context.MediaFiles
                .Where(m => m.AnnotationId == annotationId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<MediaFile> GetByIdAsync(int id)
        {
            return await _context.MediaFiles
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MediaFile> CreateAsync(MediaFile mediaFile)
        {
            _context.MediaFiles.Add(mediaFile);
            await _context.SaveChangesAsync();
            return mediaFile;
        }

        public async Task DeleteAsync(int id)
        {
            var mediaFile = await _context.MediaFiles.FindAsync(id);
            if (mediaFile != null)
            {
                _context.MediaFiles.Remove(mediaFile);
                await _context.SaveChangesAsync();
            }
        }
    }
}