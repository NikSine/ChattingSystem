using System.ComponentModel.DataAnnotations;

namespace ChattingSystem.Models
{
    public class RegisterModel
    {
        [Required]
        [EmailAddress(ErrorMessage = "Неверный email")]
        public string Email { get; set; }

        [Required]
        public string ChatName { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required]
        [Compare("Password", ErrorMessage = "Пароли не совпадают")]
        [DataType(DataType.Password)]
        public string PasswordConfirm { get; set; }
    }
}