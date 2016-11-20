using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace ChattingSystem.Models
{
    public class ApplicationContext:IdentityDbContext<ApplicationUser>
    {
        public ApplicationContext() : base("IdentityDb") { }

        public DbSet<Message> Messages { get; set; }

        public static ApplicationContext Create()
        {
            return new ApplicationContext();
        }
    }
}