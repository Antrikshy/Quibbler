$(document).ready(function() {
    // Socket.IO stuff
    var socket = io();

    $(".main-chat-form").submit(function () {
        socket.emit('new message', $(".message-prompt").val());
        $(".message-prompt").val('');

        return false;
    });

    socket.on('new message', function (msgObj) {
        var randomId = Math.floor(Math.random() * 10000);
        var messageHtml = "<span class='message' id='" + randomId + "'>" + msgObj.msg + "</span>";
        
        $(".visualizer").append(messageHtml);
        
        $(".message#" + randomId).css('top', msgObj.cssTop.toString() + "%");
        $(".message#" + randomId).css('left', msgObj.cssLeft.toString() + "%");
        $(".message#" + randomId).css('font-size', msgObj.cssFontSize.toString() + "rem");
        
        $(".message#" + randomId).addClass('animated bounceIn');
        $(".message#" + randomId).on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated bounceIn').delay(8000).fadeOut(5000, function () {
                $(this).remove();
            });
        });

        console.log("Message sent: " + msgObj.msg);
    });

    socket.on('user count', function (count) {
        $(".user-count").text(count);
    });

    socket.on('new topic', function (topic) {
        if (topic.url)
            $("span.chat-topic").html("<span class='chat-topic'><a href='" + topic.url + "'>" + topic.title + "</a></span>");
        else
            $("span.chat-topic").html("<span class='chat-topic'>" + topic.title + "</span>");
    });

    // Design stuff
    var formActive = false;

    if ($(window).width() < 568)
        formActive = true;   
    
    $(".send-btn").click(function (e) {
        if (!formActive || $(".main-chat-form").position().left < 0) {
            e.preventDefault();
            
            $(".main-chat-form").animate({"left": "0"}, 'slow');
            $(".message-prompt").focus();

            if ($(window).width() < 860) {
                $(".about-container").fadeOut('slow');
            }

            formActive = true;
        }

        else {
            if ($(".message-prompt").val().length == 0 || $(".message-prompt").val().length > 50) {
                e.preventDefault();
            }
        }
    });

    $(document).click(function (e) {
        if (formActive) {
            if (!$(e.target).closest('.main-chat-form').length) {
                $(".message-prompt").blur();
                $(".main-chat-form").animate({"left": "-60vw"}, 'slow');
                $(".about-container").fadeIn('slow');
                
                formActive = false;
            }
        }
    });
});
