var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var fs = require('fs');
var schedule = require('node-schedule');
var antiSpam = require('socket-anti-spam');

var routes = require('./routes');
var topicHandler = require(path.resolve(__dirname, 'lib', 'topic_handler.js'));

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

topicsLocation = path.resolve(__dirname, 'lib', 'topics.json');
manualTopicsLocation = path.resolve(__dirname, 'lib', 'manual-topics.json');

currTopic = {
    "topic": "Loading...",
    "url": null
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

var antiSpam = new antiSpam({
    spamCheckInterval: 3000,
    spamMinusPointsPerInterval: 3,
    spamMaxPointsBeforeKick: 21,
    spamEnableTempBan: true,
    spamKicksBeforeTempBan: 3,
    spamTempBanInMinutes: 120,
    removeKickCountAfter: 1,
});

// Maps from socket ID to an array of length 5, each containing a timestamp of a
// recent message
var recentMessages = {};

numOfUsers = 0;
var messageColors = ["#FFFFFF", "#044B7F"];
io.on('connection', function (socket) {
    antiSpam.onConnect(socket);
    recentMessages[socket.id] = [];

    numOfUsers++;
    io.emit('user count', numOfUsers);
    console.log("User connected, total: " + numOfUsers);

    socket.on('new message', function (message) {
        if (typeof(message) != 'string')
            return;

        var recent = recentMessages[socket.id];
        if (recent.length == 10 &&
            recent[0] > Date.now() - 10000) {
            // Rate limited -- 10 messages in 10 seconds, no more
            return;
        }

        if (message.length > 0 && message.length < 100) {
            var top = getRandomInt(10, 85);
            var left = getRandomInt(2, 90);
            var fontSize = (message.length < 25) ? getRandomFloat(1, 2) : getRandomFloat(0.8, 1.3);
            var color = messageColors[getRandomInt(0, messageColors.length - 1)];

            io.emit('new message',
                {"msg": message, "cssTop": top, "cssLeft": left, "cssFontSize": fontSize, "cssColor": color});
            console.log("New message: " + message);
        }

        recent.push(new Date());
        if (recent.length > 10) {
            recent.shift();
        }
    });

    socket.on('disconnect', function() {
        numOfUsers--;
        io.emit('user count', numOfUsers);
        console.log("User disconnected, total: " + numOfUsers);
        delete recentMessages[socket.id];
    });
});

topicHandler.firstTimeSetup();

topicHandler.topicsScheduler(function () {
    broadcastTopic(topicHandler.getNextTopic());
});

var rule = new schedule.RecurrenceRule();
rule.minute = [0, 15, 30, 45];
var j = schedule.scheduleJob(rule, function () {
    broadcastTopic(topicHandler.getNextTopic());
});

function broadcastTopic(topicObj) {
    currTopic = topicObj;
    io.emit('new topic', currTopic);
    console.log("New topic: " + currTopic.title);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = server;
