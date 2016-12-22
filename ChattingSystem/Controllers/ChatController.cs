using ChattingSystem.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ChattingSystem.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        ApplicationContext context = new ApplicationContext();
        // GET: Chat
        public ActionResult Index()
        {
            var user = System.Web.HttpContext.Current.GetOwinContext().
                GetUserManager<ApplicationUserManager>().
                FindById(System.Web.HttpContext.Current.User.Identity.GetUserId());
            return View(user);
        }

        
        [HttpPost]
        public ActionResult ChangeProfile(HttpPostedFileBase photo, string nickname)
        {
            string currentUserId = User.Identity.GetUserId();

            var user = context.Users.FirstOrDefault(x => x.Id == currentUserId);

            string fileName = "";

            if (photo != null)
            {
                photo = Request.Files[0];

                fileName = Path.GetFileName(photo.FileName);

                var path = Path.Combine(Server.MapPath("~/Photo/"), fileName); 
                   
                photo.SaveAs(path);

                user.Photo = "http://localhost:51129/Photo/" + fileName;

                context.SaveChanges();
            }

            if (nickname != user.ChatName)
            {
                user.ChatName = nickname;
                context.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase messagefile)
        {
            string fileName = "";

            if (Request.Files.Count > 0)
            {
                messagefile = Request.Files[0];

                if (messagefile != null && messagefile.ContentLength > 0)
                {
                    fileName = Path.GetFileName(messagefile.FileName);

                    var path = Path.Combine(Server.MapPath("~/Files/"), fileName);

                    if (!path.Contains(fileName))
                    {
                        messagefile.SaveAs(path);
                    }            
                }
            }
            var completepath = Request.Url.GetLeftPart(UriPartial.Authority)+"/Chat/Download?FileName="+fileName;

            return Content(completepath);
        }

        public FileResult Download(string FileName)
        {
            return File(Server.MapPath("~/Files/" + FileName), System.Net.Mime.MediaTypeNames.Application.Octet);
        }

        [HttpGet]
        public ActionResult GetAllMessages(string id)
        {

            var query = (from user in context.Users where user.Id == id select user.Photo).ToList();

            return View(query);
        }

        public ActionResult UserInfo(string name)
        {
            var userinfo = context.Users.FirstOrDefault(x => x.ChatName == name);
            return View(userinfo);
        }

    }
}
//string currentUserId = User.Identity.GetUserId();

//var user = context.Users.FirstOrDefault(x => x.Id == currentUserId);

//            if (photo != null)
//            {
//                MemoryStream target = new MemoryStream();
//photo.InputStream.CopyTo(target);
//                byte[] data = target.ToArray();
//user.Photo = data;
//                context.SaveChanges();
//            }

//            if (nickname != user.ChatName)
//            {
//                user.ChatName = nickname;
//                context.SaveChanges();
//            }
//            return RedirectToAction("Index");