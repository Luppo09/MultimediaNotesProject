using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MultimediaNotes.API.Models
{
    public class MediaFile
    {
        public int Id { get; set; }

        public string FileName { get; set; }

        public string FilePath { get; set; }

        public string FileType { get; set; } // "imagem e audio por enquanto

        public string MimeType { get; set; } // extensão do arquivo

        public long FileSize { get; set; } // bytes

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relacionamento com Annotation
        public int AnnotationId { get; set; }

        [ForeignKey("AnnotationId")]
        public Annotation Annotation { get; set; }
    }
}

