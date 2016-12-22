namespace ChattingSystem.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Reboot : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Comments", "MessageId", "dbo.Messages");
            DropForeignKey("dbo.Comments", "UserId", "dbo.AspNetUsers");
            DropIndex("dbo.Comments", new[] { "MessageId" });
            DropIndex("dbo.Comments", new[] { "UserId" });
            DropTable("dbo.Comments");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.Comments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        MessageId = c.Int(nullable: false),
                        UserId = c.String(maxLength: 128),
                        CommentText = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateIndex("dbo.Comments", "UserId");
            CreateIndex("dbo.Comments", "MessageId");
            AddForeignKey("dbo.Comments", "UserId", "dbo.AspNetUsers", "Id");
            AddForeignKey("dbo.Comments", "MessageId", "dbo.Messages", "Id", cascadeDelete: true);
        }
    }
}
