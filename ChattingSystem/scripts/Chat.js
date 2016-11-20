
$(function () {
    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;
    // Create a function that the hub can call to broadcast messages.
    chat.client.addMessage = function (name, message, photo) {
        // Html encode display name and message.
        $(".loader").fadeOut("slow");
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page.
        $('#discussion').append('<div class="messagein"><img class="chatimage" src="data:image/png;base64,' + photo + '"/>' + '&nbsp;&nbsp'+ encodedName
            + '<p><p>&nbsp;&nbsp' + linkify(encodedMsg) + '</div>').children(':last').hide().fadeIn(500);
        $('div#room').scrollTop($('div#room')[0].scrollHeight);
    };

    chat.client.onConnected = function (id, userName, allUsers, allMessages) {
        $('#hdId').val(id);
        $("#displayname").val(userName);
        // Добавление всех пользователей
        for (userId in allUsers)
        {
            AddUser(userId, allUsers[userId]);
        }
        for (var i = 0; i < allMessages.length; i++) {
            chat.client.addMessage(allMessages[i].ChatName, allMessages[i].MessageText, allMessages[i].Photo)
        }       
    }

    // Добавляем нового пользователя
    chat.client.onNewUserConnected = function (id, userName) {    
                AddUser(id, userName);
            }
        
    // Удаляем пользователя
    chat.client.onUserDisconnected = function (id, userName) {
        $('#' + id).remove();
    }


    // Get the user name and store it to prepend to messages.
    //$('#displayname').val(prompt('Enter your name:', ''));

    // Set initial focus to message input box.
    $('#message').focus();
    // Start the connection.
    $.connection.hub.start().done(function () {

        $('#sendmessage').click(function () {
            // Call the Send method on the hub.
            chat.server.send($('#message').val());
            // Clear text box and reset focus for next comment.
            $('#message').val('').focus();
        });

        $("#message").keypress(function (e) {
            if (e.which == 13) {
                $('#sendmessage').click();
            }
        });
       
    });

    $('#logout').click(function () {
        $.connection.hub.stop();
    });
});

function AddUser(id, userName) {

    var userId = $('#hdId').val();

    if (userId != id) {

        $("#chatusers").append('<p id="' + id + '"><b>' + userName + '</b></p>');
    }
}

function linkify(text) {
    if (text) {
        text = text.replace(
            /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
            function (url) {
                var full_url = url;
                if (!full_url.match('^https?:\/\/')) {
                    full_url = 'http://' + full_url;
                }
                return '<a href="' + full_url + '">' + url + '</a>';
            }
        );
    }
    return text;
}


$('#messagefile').on('change', function () {
    if (this.files[0] != null) {
        data = new FormData();
        data.append('messagefile', this.files[0]);

        $.ajax({
            type: "POST",
            url: "/Chat/Upload/",
            enctype: 'multipart/form-data',
            processData: false,  // do not process the data as url encoded params
            contentType: false,  // by default jQuery sets this to urlencoded string
            data: data,
            success: function (response) {
                $('#message').val(response);
            }
        });
    }
});




//(function () {
//    var app = angular.module('chat-app', []);

//    app.controller('ChatController', function ($scope) {
//        // scope variables
//        $scope.name = 'Guest'; // holds the user's name
//        $scope.message = ''; // holds the new message
//        $scope.messages = []; // collection of messages coming from server
//        $scope.chatHub = null; // holds the reference to hub

//        $scope.chatHub = $.connection.chatHub; // initializes hub
//        $.connection.hub.start(); // starts hub

//        // register a client method on hub to be invoked by the server
//        $scope.chatHub.client.addMessage = function (name, message) {
//            var newMessage = name + ' says: ' + message;

//            // push the newly coming message to the collection of messages
//            $scope.messages.push(newMessage);
//            $scope.$apply();
//        };

//        $scope.newMessage = function () {
//            // sends a new message to the server
//            $scope.chatHub.server.Send($scope.message);

//            $scope.message = '';
//        };
//    });
//}());