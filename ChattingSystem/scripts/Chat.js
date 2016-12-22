
$(function () {
    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;
    // Create a function that the hub can call to broadcast messages.
    chat.client.addMessage = function (name, id, message, photo) {
        // Html encode display name and message.
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();
        // Add the message to the page.
        if (name != $('#displayname').val())
        {
            $('#discussion').append('<div class="messagein" id="' + id + '"><img class="chatimage img-circle" src="' + photo + '"/>' + '&nbsp;&nbsp' + encodedName
                + '<p><p class="textmargin">' + linkify(encodedMsg) + '</p><p class="textmargin"><a class ="commentMessage">Комментировать</a></p></div>').children(':last').hide().fadeIn(500);
        }
        else
        {
            $('#discussion').append('<div class="messagein" id="' + id + '"><img class="chatimage img-circle" src="' + photo + '"/>' + '&nbsp;&nbsp' + encodedName
               + '<p><p class="textmargin">' + linkify(encodedMsg) + '</p></p><p class="textmargin"><a class ="commentMessage">Комментировать</a><a class ="removeMessage">Удалить</a></p></div>').children(':last').hide().fadeIn(500);
        }
        $('#discussion').scrollTop($('#discussion')[0].scrollHeight);
    };

     
    $(document).on('click', '.removeMessage', function (e) {
        if (confirm('Вы действительно хотите удалить сообщение?'))
        {
            chat.server.removeMessage($(e.target).parent().parent().attr('id'));
            $(e.target).parent().parent().hide("slow", function () { $(this).remove(); })
        }
    });

    chat.client.removeMessage = function (id) {
        $('#' + id).hide("slow", function () { $(this).remove(); });
    }

    $(document).on('click', '.commentMessage', function (e) {

        $(e.target).hide();

        $(e.target).parent().parent().append('<div id="commentDiv"><input id="commentInput" type="text"/><button id="commentButton">Отправить</button><span id="closeCommentInputs" class="glyphicon glyphicon-remove"/></div>').children(':last').hide().fadeIn(500);

    });

    $(document).on('click', '#closeCommentInputs', function (e) {

        $(e.target).parent().hide();

        $(".commentMessage").show();
    });
   
    $(document).on('click', '#commentButton', function (e) {

        var text = $(e.target).parent().find('#commentInput').val();

        var id = $(e.target).parent().parent().attr('id');

        chat.server.commentMessage(text, id);

        $(e.target).parent().hide();

        $(".commentMessage").show();
    });



    chat.client.commentMessage = function (id, username, messageId, comment, photo) {

        var encodedName = $('<div />').text(username).html();

        var encodedComment = $('<div />').text(comment).html();

        if (username == $('#displayname').val())
        {
            $('#' + messageId).append('<div id ="comment_' + id + '"class="commentblock1"><p><img class="chatimage img-circle" src="' + photo + '"/>'
                + '&nbsp;&nbsp' + encodedName + '<span id="removeComment" class="glyphicon glyphicon-remove"/></p><p class="textmargin">'
                + linkify(encodedComment) + '</p></div>').children(':last').hide().fadeIn(500);
        }
        else
        {
            $('#' + messageId).append('<div id ="comment_' + id + '"class="commentblock2"><p><img class="chatimage img-circle" src="' + photo + '"/>'
               + '&nbsp;&nbsp' + encodedName + '</p><p class="textmargin">'
               + linkify(encodedComment) + '</p></div>').children(':last').hide().fadeIn(500);
        }
    };

    $(document).on('click', '#removeComment', function (e) {
        
        if (confirm('Вы действительно хотите удалить комментарий?'))
        {
            var id = $(e.target).parent().parent().attr("id").replace("comment_", "");

            chat.server.removeComment(id);

            $(e.target).parent().parent().hide("slow", function () { $(this).remove(); })
        }        
    });

    //$(document).on('click', '.userinfo', function (e) {
    //    $.ajax({
    //        url: '/Chat/UserInfo/',
    //        data: { name: }
    //    }).done(function () {
    //        alert('Added');
    //    });
    //});


    chat.client.removeComment = function (id) {
        $('#comment_' + id).hide("slow", function () { $(this).remove(); });
    }

    chat.client.onConnected = function (id, userName, allUsers, allMessages, allComments) {
        $('#hdId').val(id);
        $("#displayname").val(userName);
        $(".loader").fadeOut("slow");
       
        // Добавление всех пользователей

        for (userId in allUsers)
        {
            AddUser(userId, allUsers[userId]);
        }

        for (var i = 0; i < allMessages.length; i++)
        {
            chat.client.addMessage(allMessages[i].ChatName, allMessages[i].Id, allMessages[i].MessageText, allMessages[i].Photo)
        }

        for (var i = 0; i < allComments.length; i++)
        {
            chat.client.commentMessage(allComments[i].Id, allComments[i].ChatName, allComments[i].MessageId, allComments[i].CommentText, allComments[i].Photo)
        }
        
    }

    // Добавляем нового пользователя
    chat.client.onNewUserConnected = function (id, userName) {
        AddUser(id, userName);
    }

    // Удаляем пользователя
    chat.client.onUserDisconnected = function (id, userName) {
        var ctrId = 'private_' + id;
        $('#' + ctrId).remove();
        $('#' + id).remove();
    }


    chat.client.sendPrivateMessage = function (windowId, fromUserName, message, photo) {

        var ctrId = 'private_' + windowId;


        if ($('#' + ctrId).length == 0)
        {
            createPrivateChatWindow(windowId, ctrId, fromUserName);
        }

        if (fromUserName != $("#displayname").val())
        {
            $('#' + ctrId).find('#divMessage').append('<div class="message2"><img class="privatechatimage img-circle" src="' + photo + '"/>&nbsp<span class="userName">' + fromUserName + '</span><p>' + linkify(message) + '</p></div>').children(':last').hide().fadeIn(500);
        }
        else
        {
            $('#' + ctrId).find('#divMessage').append('<div class="message"><img class="privatechatimage img-circle" src="' + photo + '"/>&nbsp<span class="userName">' + fromUserName + '</span><p>' + linkify(message) + '</p></div>').children(':last').hide().fadeIn(500);
        }
        

        // set scrollbar
        var height = $('#' + ctrId).find('#divMessage')[0].scrollHeight;

        $('#' + ctrId).find('#divMessage').scrollTop(height);

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

        $('#discussion').scrollTop($('#discussion')[0].scrollHeight);

    });

    $('#logout').click(function () {
        $.connection.hub.stop();
    });
});

function AddUser(id, userName) {

    var userId = $('#hdId').val();

    var code = "";
    if (userId != id) {
        code = $('<p><a class="noselect" id="' + id + '">' + userName + '</a></p>');
        $(code).click(function () {

            var id = $(this).children().attr('id');

            if (userId != id) {
                OpenPrivateChatWindow(id, userName);

            }

        });    
    }
    $("#chatusers").append(code);
}



function OpenPrivateChatWindow(id, userName) {

    var ctrId = 'private_' + id;

    if ($('#' + ctrId).length > 0) return;

    createPrivateChatWindow(id, ctrId, userName);

}



function createPrivateChatWindow(userId, ctrId, userName) {

    var div = '<div id = "' + ctrId + '" class="chatwindowborder ui-widget-content draggable">' +
               '<div class="header">' +
                   '<span id="imgDelete" class="glyphicon glyphicon-remove"/>' +
                   '<span class="selText">' + userName + '</span>' +
               '</div>' +
               '<div id="divMessage" class="messageArea">' +

               '</div>' +
            
                 '<div class="inputs">' +
                  '<input id="txtPrivateMessage" class="msgText" type="text"   />' +
                  '<input id="btnSendMessage" class="submitButton button" type="button" value="Отправить" placeholder="Ввод сообщения"/>' +
                    '</div>'
              + '</div>';

    var $div = $(div);

    // DELETE BUTTON IMAGE
    $div.find('#imgDelete').click(function () {
        $('#' + ctrId).remove();
    });

    // Send Button event
    $div.find("#btnSendMessage").click(function () {

        $textBox = $div.find("#txtPrivateMessage");
        var msg = $textBox.val();
        if (msg.length > 0) {

            $.connection.chatHub.server.sendPrivateMessage(userId, msg);
            $textBox.val('');
        }
    });

    // Text Box event
    $div.find("#txtPrivateMessage").keypress(function (e) {
        if (e.which == 13) {
            $div.find("#btnSendMessage").click();
        }
    });

    AddDivToContainer($div);
}


function AddDivToContainer($div) {
    $('#container').append($div).children(':last').hide().fadeIn(500);

    ($div).position({
            of: $(window)
    });

    $div.draggable({

        handle: ".header",
        stop: function () {

        }
    });

    $()
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
