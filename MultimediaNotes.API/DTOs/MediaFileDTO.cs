using System.ComponentModel.DataAnnotations;

namespace MultimediaNotes.API.DTOs
{
    public class MediaFileDTO
    {
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public string FileType { get; set; }

        [Required]
        public string MimeType { get; set; }

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; }

        public int AnnotationId { get; set; }
    }
}
