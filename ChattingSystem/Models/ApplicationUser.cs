using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ChattingSystem.Models
{
    public class ApplicationUser: IdentityUser
    {
        public byte[] Photo { get; set; }

        public string ChatName { get; set; }

        public string UserConnectionId { get; set; }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            return userIdentity;
        }

        // Тут устанавливаем связь с нашей таблицей
        public virtual ICollection<Message> Messages { get; set; }
        public virtual ICollection<PrivateMessage> PrivateMessages { get; set; }

        public ApplicationUser()
        {
            Messages = new List<Message>();
            PrivateMessages = new List<PrivateMessage>();
        }
    }
}