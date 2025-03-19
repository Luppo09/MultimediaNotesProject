namespace MultimediaNotes.API.Models.Repositories.Interfaces
{
    public interface IAnnotationRepository
    {
        Task<IEnumerable<Annotation>> GetAllAnotations();
        Task<Annotation>GetAnnotationById(int id);
        Task<IEnumerable<Annotation>> GetAnnotationsByUserId(int userId);
        Task<Annotation> CreateAnnotation(Annotation annotation);
        Task<Annotation> UpdateAnnotation(Annotation annotation);
        Task<Annotation> DeleteAnnotation(int id);
    }
}
