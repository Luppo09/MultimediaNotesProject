namespace MultimediaNotes.API.Models
{
    public class Annotation
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int Priority { get; set; } // 1 = Baixa, 2 = Média, 3 = Alta
        public DateTime? Reminder { get; set; } // Lembrete opcional
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
