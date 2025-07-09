namespace MultimediaNotes.API.Models
{
    public class Annotation
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public int Priority { get; set; } // 1 = Low, 2 = Medium, 3 = High
        public DateTime? Reminder { get; set; } // Optional reminder
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
