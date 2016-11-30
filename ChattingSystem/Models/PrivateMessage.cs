using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChattingSystem.Models
{
    public class PrivateMessage
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public string ToUserName { get; set; }

        public string MessageText { get; set; }
    
        public virtual ApplicationUser User { get; set; }
    }
}