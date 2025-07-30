namespace MultimediaNotes.API.Models
{
    public class Annotation
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int Priority { get; set; } // 1 = Baixo, 2 = Médio, 3 = Alto
        public DateTime? Reminder { get; set; } 
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
