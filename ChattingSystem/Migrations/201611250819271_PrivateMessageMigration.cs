namespace ChattingSystem.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class PrivateMessageMigration : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.PrivateMessages",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(maxLength: 128),
                        ToUserName = c.String(),
                        MessageText = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId)
                .Index(t => t.UserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.PrivateMessages", "UserId", "dbo.AspNetUsers");
            DropIndex("dbo.PrivateMessages", new[] { "UserId" });
            DropTable("dbo.PrivateMessages");
        }
    }
}
