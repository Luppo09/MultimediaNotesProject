using MultimediaNotes.API.DTOs;

namespace MultimediaNotes.API.Services.Interfaces
{
    public interface IAnnotationService
    {
        Task<IEnumerable<AnnotationDTO>> GetAllAnotations();
        Task<AnnotationDTO>GetAnnotationById(int id);
        Task<IEnumerable<AnnotationDTO>> GetAnnotationsByUserId(int userId);
        Task CreateAnnotation(AnnotationDTO annotationDTO);
        Task UpdateAnnotation(AnnotationDTO annotationDTO);
        Task DeleteAnnotation(int id);
    }
}
