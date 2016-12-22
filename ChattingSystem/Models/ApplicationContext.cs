using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;

namespace ChattingSystem.Models
{
    public class ApplicationContext:IdentityDbContext<ApplicationUser>
    {
        public ApplicationContext() : base("IdentityDb") { }

        public DbSet<Message> Messages { get; set; }

        public DbSet<PrivateMessage> PrivateMessages { get; set; }

        public DbSet<Comment> Comments { get; set; }

        public static ApplicationContext Create()
        {
            return new ApplicationContext();
        }
    }
}