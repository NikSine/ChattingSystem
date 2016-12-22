using Newtonsoft.Json;
using System.Collections.Generic;

namespace ChattingSystem.Models
{
    public class Message
    {
        public int Id { get; set; }

        public string MessageText { get; set; }

        public string UserId { get; set; }

        public virtual ICollection<Comment> Comments { get; set; }

        [JsonIgnore]
        public virtual ApplicationUser User { get; set; }
    }
}