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
            $(this).removeClass('animated bounceIn').delay(5000).fadeOut(4000, function () {
                $(this).remove();
            });
        });

        console.log("New message received: " + msgObj.msg);
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

            if ($(window).width() < 860) {
                $(".about").fadeOut('slow');
            }

            formActive = true;
        }

        else {
            if ($(".message-prompt").val() === '')
                e.preventDefault();
        }
    });

    $(document).click(function (e) {
        if (formActive) {
            if (!$(e.target).closest('.main-chat-form').length) {
                $(".message-prompt").blur();
                $(".main-chat-form").animate({"left": "-60vw"}, 'slow');
                $(".about").fadeIn('slow');
                
                formActive = false;
            }
        }
    });
});
