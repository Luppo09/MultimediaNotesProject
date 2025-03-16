namespace MultimediaNotes.API.Models.Repositories
{
    public interface IAnnotationRepository
    {
        Task<Annotation> GetAnnotationByIdAsync(int id);
        Task<IEnumerable<Annotation>> GetAnnotationsByUserIdAsync(int userId);
        Task AddAnnotationAsync(Annotation annotation);
        Task UpdateAnnotationAsync(Annotation annotation);
        Task DeleteAnnotationAsync(int id);
    }
}
