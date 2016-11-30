
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
            $('#discussion').append('<div class="messagein id="'+id+'"><img class="chatimage img-circle" src="data:image/png;base64,' + photo + '"/>' + '&nbsp;&nbsp' + encodedName
                + '<p><p>&nbsp;&nbsp' + linkify(encodedMsg) + '</div>').children(':last').hide().fadeIn(500);
        }
        else
        {
            $('#discussion').append('<div id="message_' + id + '"' + 'class="messagein"><img class="chatimage img-circle" src="data:image/png;base64,' + photo + '"/>' + '&nbsp;&nbsp' + encodedName 
               + '<p>&nbsp;&nbsp' + linkify(encodedMsg) + '<p>&nbsp;&nbsp<a class ="removeMessage" href="#">Удалить</a></p></div>').children(':last').hide().fadeIn(500);
        }
        $('div#room').scrollTop($('div#room')[0].scrollHeight);
    };

     
    $(document).on('click', '.removeMessage', function () {
        
        console.log($(this).id);

    });

    chat.client.onConnected = function (id, userName, allUsers, allMessages) {
        $('#hdId').val(id);
        $("#displayname").val(userName);
        $(".loader").fadeOut("slow");
        // Добавление всех пользователей
        for (userId in allUsers) {
            AddUser(userId, allUsers[userId]);
        }
        for (var i = 0; i < allMessages.length; i++) {
            chat.client.addMessage(allMessages[i].ChatName, allMessages[i].Id, allMessages[i].MessageText, allMessages[i].Photo)
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


    chat.client.sendPrivateMessage = function (windowId, fromUserName, message) {

        var ctrId = 'private_' + windowId;


        if ($('#' + ctrId).length == 0) {

            createPrivateChatWindow(windowId, ctrId, fromUserName);

        }

        $('#' + ctrId).find('#divMessage').append('<div class="message"><span class="userName">' + fromUserName + '</span><p>' + linkify(message) + '</p></div>');

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

    });

    $('#logout').click(function () {
        $.connection.hub.stop();
    });




});




$('#messageRemove').click(function () {
    alert("sssss");
});
 


function AddUser(id, userName) {

    var userId = $('#hdId').val();

    var code = "";
    if (userId != id) {
        code = $('<div style = "cursor:pointer;" id="' + id + '"><b>' + userName + '</b></p>');
        $(code).dblclick(function () {

            var id = $(this).attr('id');

            if (userId != id){
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

    var div = '<div id = "' + ctrId +'">'+ '<div style="border: 1px solid white; width:223px; background-color:#14141f; color:white;" class="ui-widget-content draggable " rel="0">' +
               '<div class=" header" style=" cursor:move; color:white; width:223px; border-bottom:1px solid white;">' +
                  '<div  style="float:right;">' +
                      '<span id="imgDelete" class="glyphicon glyphicon-remove"  style="cursor:pointer;"/>' +
                   '</div>' +

                   '<span class="selText" rel="0">' + userName + '</span>' +
               '</div>' +
               '<div id="divMessage" class="messageArea" style="height:200px;overflow-y:auto;" >' +

               '</div>' +
              
           '</div>'+
                 '<div class="buttonBar">' +
                   '<input id="txtPrivateMessage" class="msgText" type="text"   />' +
                  '<input id="btnSendMessage" class="submitButton button" type="button" value="Send"   />' +
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
    $('#container').append($div);

    ($div).position({
            of: $(window)
    });

    $div.draggable({

        handle: ".header",
        stop: function () {

        }
    });
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

    $('#messageRemove').click(function () {
        alert("hello");
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
