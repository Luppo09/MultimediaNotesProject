namespace MultimediaNotes.API.Models.Repositories.Interfaces
{
    public interface IMediaFileRepository
    {
        
        Task<IEnumerable<MediaFile>> GetByAnnotationIdAsync(int annotationId);
        Task<MediaFile> GetByIdAsync(int id);
        Task<MediaFile> CreateAsync(MediaFile mediaFile);
        Task DeleteAsync(int id);
    }
}

