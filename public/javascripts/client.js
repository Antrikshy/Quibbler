$(document).ready(function() {
    // Socket.IO stuff
    var socket = io();

    $(".main-chat-form").submit(function () {
        socket.emit('new message', $(".message-prompt").val());
        $(".message-prompt").val('');
        return false;
    });

    socket.on('new message', function (msgObj) {
        console.log("New message received: " + msgObj.msg);
        var randomId = Math.floor(Math.random() * 10000);
        var messageHtml = "<span class='message' id='" + randomId + "'>" + msgObj.msg + "</span>";
        $(".visualizer").append(messageHtml);
        $(".message#" + randomId).css('top', msgObj.cssTop.toString() + "%");
        $(".message#" + randomId).css('left', msgObj.cssLeft.toString() + "%");
        $(".message#" + randomId).addClass('animated bounceIn');
    });

    socket.on('user count', function (count) {
        $(".user-count").text(count);
    });

    // Design stuff
    var formActive = false;
    
    $(".send-btn").click(function (e) {
        if (!formActive) {
            e.preventDefault();
            $(".main-chat-form").animate({"left": "0"}, 'slow');
            $(".message-prompt").focus();
            formActive = true;
        }

        else {
            if ($(".message-prompt").val() === "")
                e.preventDefault();
        }
    });
});