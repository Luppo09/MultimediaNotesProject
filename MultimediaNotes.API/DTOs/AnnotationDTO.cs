using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MultimediaNotes.API.DTOs
{
    public class AnnotationDTO
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(50, ErrorMessage = "Title cannot exceed 50 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Content is required.")]
        public string Content { get; set; }

        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
        public string Category { get; set; }

        [Range(1, 3, ErrorMessage = "Priority must be between 1 (Low) and 3 (High).")]
        public int Priority { get; set; } // 1 = Baixo, 2 = Médio, 3 = Alto

        public DateTime? Reminder { get; set; } 

        [Required(ErrorMessage = "UserId is required.")]
        public int UserId { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public UserDTO User { get; set; }
    }
}
