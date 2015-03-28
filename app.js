var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var fs = require('fs');
var watchr = require('watchr');

var routes = require('./routes');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var topicsLocation = path.resolve('lib', 'topics.json');
var topics = require(topicsLocation);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

numOfUsers = 0;
io.on('connection', function (socket) {
    numOfUsers++;
    io.emit('user count', numOfUsers);
    console.log("User connected, total: " + numOfUsers);

    socket.on('new message', function (message) {
        var top = getRandomInt(10, 85);
        var left = getRandomInt(2, 90);
        var fontSize = getRandomFloat(1, 2);

        io.emit('new message', {"msg": message, "cssTop": top, "cssLeft": left, "cssFontSize": fontSize});
        console.log("New message: " + message);
    });

    socket.on('disconnect', function() {
        numOfUsers--;
        io.emit('user count', numOfUsers);
        console.log("User disconnected, total: " + numOfUsers);
    });
});

watchr.watch({
    path: topicsLocation,
    listeners: {
        error: function (err) {
            console.log("watchr error: " + err);
        },
        change: function () {
            fs.readFile(topicsLocation, 'utf8', function (err, data) {
                if (err) console.log("fs error reading topics.json: " + err);
                else {
                    topics = JSON.parse(data);
                    console.log("Topics updated.");
                    console.log(topics);
                }
            });
        }
    }
});

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
