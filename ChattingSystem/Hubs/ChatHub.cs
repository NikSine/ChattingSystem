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
            int id=0;
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

                    var currentUserName = currentUser.ChatName;

                    id = currentMessage.Id;

                    return currentUserName;

                });

                var photo = currentUser.Photo;

                Clients.All.addMessage(task.Result, id, message, photo);
            }
        }

        public void SendPrivateMessage(string toUserId, string message)
        {

            string fromUserId = Context.ConnectionId;

            var toUser = Users.FirstOrDefault(x => x.Key == toUserId);
            var fromUser = Users.FirstOrDefault(x => x.Key == fromUserId);

            if (toUser.Key != null && fromUser.Key != null)
            {
                // send to 
                Clients.Client(toUserId).sendPrivateMessage(fromUserId, fromUser.Value, message);

                // send to caller user
                Clients.Caller.sendPrivateMessage(toUserId, fromUser.Value, message);

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
            var currentUser = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>().FindById(HttpContext.Current.User.Identity.GetUserId());

            string id = Context.ConnectionId;

            string name = currentUser.ChatName;

            var messages = from user in context.Users join message in context.Messages on user.Id equals message.UserId select new { user.ChatName, user.Photo, message.MessageText, message.Id};

            if (Users.Values.All(x => x != name))
            {
                Users.Add(Context.ConnectionId, name);
                Clients.Caller.onConnected(id, name, Users, messages.ToList());
                Clients.AllExcept(id).onNewUserConnected(id, name);
            }    
            return base.OnConnected();
        }
    }
}

