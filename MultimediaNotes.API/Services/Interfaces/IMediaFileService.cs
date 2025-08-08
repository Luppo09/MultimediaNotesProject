using MultimediaNotes.API.DTOs;

namespace MultimediaNotes.API.Services.Interfaces
{
    public interface IMediaFileService
    {
        
        Task<IEnumerable<MediaFileDTO>> GetFilesByAnnotationIdAsync(int annotationId);
        Task<MediaFileDTO> GetFileByIdAsync(int id);
        Task<Stream> GetFileStreamAsync(int id);
        Task<MediaFileDTO> UploadFileAsync(MediaFileUploadDTO uploadDto);
        Task<bool> DeleteFileAsync(int id);
    }
}

