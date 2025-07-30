using Microsoft.AspNetCore.Identity;

namespace MultimediaNotes.API.Models
{
    public class User : IdentityUser<int>
    {
        public string Name { get; set; } = string.Empty;

        
        public virtual ICollection<Annotation> Annotations { get; set; } = new List<Annotation>();
    }
}