$(document).ready(function() {
    var usertag = "";

    $(".main-chat-form").hide();
    $(".github-box").hide();

    $(".usertag-box").on("keydown", function(e) {
        if (e.keyCode == 13) {
            $(".deactivate-overlay").trigger("click");
        }
    });

    $(".usertag-box").on("input", function() {
        if ($(this).val().length > 10) {
            $(this).val(usertag);
            return;
        }

        usertag = $(this).val().trim().replace(/\s/g,'');
        $(this).val(usertag);

        usertag.length == 0 ? $(".usertag-preview").css("color", "#044B7F") : $(".usertag-preview").css("color", "#FFF");

        $(".usertag-preview").text("[" + usertag + "]");
    });

    $(".deactivate-overlay").click(function () {
        $(".intro-overlay").addClass("animated slideOutUp")
        $(".intro-active").removeClass("intro-active");
        
        $(".message.enjoy").addClass("animated bounceIn");
        $(".message.enjoy").on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated bounceIn').delay(500).fadeOut(2000, function () {
                $(this).remove();
                initClient(usertag);
            });
        });
    });

    $(".about-container").hover(
        function () {
            $(".github-box").css('visibility', 'visible').slideDown('fast');
        },
        function () {
            $(".github-box").css('visibility', 'visible').slideUp('fast');
        }
    );
});

function initClient (usertag) {
    // Socket.IO stuff
    var socket = io.connect('', {query: 'tag=' + usertag});

    $(".main-chat-form").submit(function () {
        socket.emit('new message', $(".message-prompt").val());
        $(".message-prompt").val('');

        return false;
    });

    socket.on('new message', function (msgObj) {
        var randomId = Math.floor(Math.random() * 10000);
        var messageHtml = "<span class='message-bundle' id='" + randomId + "'>" +
                            "<span class='usertag'></span><br/>" +
                            "<span class='message'></span>"
                          "</span>";    
        
        $(".visualizer").append(messageHtml);
        
        $(".message-bundle#" + randomId).css('top', msgObj.cssTop.toString() + "%");
        $(".message-bundle#" + randomId).css('left', msgObj.cssLeft.toString() + "%");
        $(".message-bundle#" + randomId + " .message").css('font-size', msgObj.cssFontSize.toString() + "rem");
        $(".message-bundle#" + randomId + " .usertag").css('font-size', (msgObj.cssFontSize * 0.6).toString() + "rem")
        $(".message-bundle#" + randomId + " .message").css('color', msgObj.cssColor[0]);
        $(".message-bundle#" + randomId + " .usertag").css('color', msgObj.cssColor[1]);
        $(".message-bundle#" + randomId + " .message").text(msgObj.msg);
        if (msgObj.usertag)
            $(".message-bundle#" + randomId + " .usertag").text("[" + msgObj.usertag + "]");

        $(".message-bundle#" + randomId).addClass('animated bounceIn');
        $(".message-bundle#" + randomId).on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated bounceIn').delay(3000).fadeOut(7000, function () {
                $(this).remove();
            });
        });

        $.titleAlert("Quibbles detected // Quibbler.co", {
            requireBlur: true,
            stopOnFocus: true,
            stopOnMouseMove: true,
            duration: 0,
            interval: 500,
            originalTitleInterval: 500
        });

        // console.log("Message sent: " + msgObj.msg);
    });

    socket.on('user count', function (count) {
        $(".user-count").text(count);
    });

    socket.on('new topic', function (topic) {
        if (topic.url)
            $("span.chat-topic").html("<em><span class='chat-topic'><a href='" + topic.url + "'>" + topic.title + "</a></span></em>");
        else
            $("span.chat-topic").html("<em><span class='chat-topic'>" + topic.title + "</span></em>");
    });

    // Design stuff
    $(".main-chat-form").fadeIn();
    if ($(window).width() > 568)
        $(".main-chat-form").addClass('animated fadeInRightBig');

    var formActive = ($(window).width() < 568) ? true : false;

    $(".send-btn").click(function (e) {
        if (!formActive) {
            e.preventDefault();
            
            $(".main-chat-form").animate({"left": "0"}, 'slow');
            $(".message-prompt").focus();

            if ($(window).width() < 860 && $(window).width() > 568) {
                $(".about-container").fadeOut('slow');
            }

            formActive = true;
        }

        else {
            if ($(".message-prompt").val().length == 0 || $(".message-prompt").val().length > 100) {
                e.preventDefault();
            }
        }
    });

    $(document).click(function (e) {
        if ($(window).width() > 568) {
            if (formActive) {
                if (!$(e.target).closest('.main-chat-form').length) {
                    $(".message-prompt").blur();
                    $(".main-chat-form").animate({"left": "-60vw"}, 'slow');
                    $(".about-container").fadeIn('slow');
                    
                    formActive = false;
                }
            }
        }
    });
}