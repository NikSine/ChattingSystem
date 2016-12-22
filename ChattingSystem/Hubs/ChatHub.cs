using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using ChattingSystem.Models;
using Microsoft.AspNet.Identity;
using System.Data.Entity;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity.Owin;

namespace ChattingSystem.Hubs
{

    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> Users = new Dictionary<string, string>();

        ApplicationContext context = new ApplicationContext();

        public void Send(string message)
        {
            if (message != "")
            {

                var currentUser = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>().FindById(HttpContext.Current.User.Identity.GetUserId());

                var task = Task.Run(async () =>
                {
                    var currentMessage = new Message
                    {
                        MessageText = message,
                        UserId = currentUser.Id
                    };

                    currentUser.Messages.Add(currentMessage);

                    context.Entry(currentMessage).State = EntityState.Added;

                    await context.SaveChangesAsync();

                    return currentMessage.Id;

                });

                var id = task.Result;

                var photo = currentUser.Photo;

                var name = currentUser.ChatName;

                Clients.All.addMessage(name, id, message, photo, currentUser.Id);
            }
        }

        public void SendPrivateMessage(string toUserId, string message)
        {
            var currentUser = HttpContext.Current.GetOwinContext().
                GetUserManager<ApplicationUserManager>().
                FindById(HttpContext.Current.User.Identity.GetUserId());

            string fromUserId = Context.ConnectionId;

            var toUser = Users.FirstOrDefault(x => x.Key == toUserId);
            var fromUser = Users.FirstOrDefault(x => x.Key == fromUserId);

            if (toUser.Key != null && fromUser.Key != null)
            {
                // send to 
                Clients.Client(toUserId).sendPrivateMessage(fromUserId, fromUser.Value, message, currentUser.Photo);

                // send to caller user
                Clients.Caller.sendPrivateMessage(toUserId, fromUser.Value, message, currentUser.Photo);

            }

        }

        public void RemoveMessage(int id)
        {
            var task = Task.Run(async () =>
            {
                var message = context.Messages.Find(id);
                context.Messages.Remove(message);
                await context.SaveChangesAsync();
            });

            Clients.All.removeMessage(id);          
        }

        public void RemoveComment(int id)
        {
            var task = Task.Run(async () =>
            {
                var comment = context.Comments.Find(id);
                context.Comments.Remove(comment);
                await context.SaveChangesAsync();
            });

            Clients.All.removeComment(id);
        }

        public void CommentMessage(string comment, int messageId)
        {
            if (comment != "")
            {
                var currentUser = HttpContext.Current.GetOwinContext().
                    GetUserManager<ApplicationUserManager>().
                    FindById(HttpContext.Current.User.Identity.GetUserId());

                var currentMessage = context.Messages.Find(messageId);

                var task = Task.Run(async () =>
                {
                    var currentComment = new Comment
                    {
                        UserId = currentUser.Id,
                        MessageId = messageId,
                        CommentText = comment
                    };

                    currentMessage.Comments.Add(currentComment);

                    context.Entry(currentComment).State = EntityState.Added;

                    await context.SaveChangesAsync();

                    return currentComment.Id;

                });

                var id = task.Result;

                Clients.All.commentMessage(id, currentUser.ChatName, currentMessage.Id, comment, currentUser.Photo);
            }
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            var item = Users.Keys.FirstOrDefault(x => x == Context.ConnectionId);
            if (item != null)
            {
                Users.Remove(item);
                var id = Context.ConnectionId;
                Clients.All.onUserDisconnected(id);
            }
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnConnected()
        {
            var currentUser = HttpContext.Current.GetOwinContext().
                GetUserManager<ApplicationUserManager>().
                FindById(HttpContext.Current.User.Identity.GetUserId());

            string id = Context.ConnectionId;

            string name = currentUser.ChatName;

            var messages = (from user in context.Users
                            join message in context.Messages on user.Id equals message.UserId
                            select new { user.ChatName, user.Photo, message.MessageText, message.Id }).ToList();

            var comments = (from coment in context.Comments
                           join user in context.Users on coment.UserId equals user.Id
                           select new { user.ChatName, user.Photo, coment.CommentText, coment.Id, coment.MessageId }).ToList();

            if (Users.Values.All(x => x != name))
            {
                Users.Add(Context.ConnectionId, name);
                Clients.Caller.onConnected(id, name, Users, messages, comments);
                Clients.AllExcept(id).onNewUserConnected(id, name);
            }    
            return base.OnConnected();
        }
    }
}

