using Newtonsoft.Json;

namespace ChattingSystem.Models
{
    public class Comment
    {
        public int Id { get; set; }

        public int MessageId { get; set; }

        public string CommentText { get; set; }

        public string UserId { get; set; }

        [JsonIgnore]
        public virtual Message Message { get; set; }

    }
}