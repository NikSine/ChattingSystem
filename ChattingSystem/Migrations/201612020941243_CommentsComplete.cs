namespace ChattingSystem.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class CommentsComplete : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Comments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        MessageId = c.Int(nullable: false),
                        CommentText = c.String(),
                        UserId = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Messages", t => t.MessageId, cascadeDelete: true)
                .Index(t => t.MessageId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Comments", "MessageId", "dbo.Messages");
            DropIndex("dbo.Comments", new[] { "MessageId" });
            DropTable("dbo.Comments");
        }
    }
}
