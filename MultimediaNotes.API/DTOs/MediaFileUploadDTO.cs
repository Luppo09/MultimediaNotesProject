using System.ComponentModel.DataAnnotations;

namespace MultimediaNotes.API.DTOs
{
    public class MediaFileUploadDTO
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public int AnnotationId { get; set; }
    }
}
