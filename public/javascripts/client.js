$(document).ready(function() {
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
    });

    socket.on('user count', function (count) {
        $(".user-count").text(count);
    });
});