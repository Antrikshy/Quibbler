var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');

var get = require('./routes/get.js');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/*', get);

numOfUsers = 0;
io.on('connection', function (socket) {
    numOfUsers++;
    console.log("User connected, total: " + numOfUsers);

    io.emit('user count', numOfUsers);

    socket.on('new message', function (message) {
        console.log("Message intercepted: " + message);
        var top = Math.floor(Math.random(100)*100);
        var left = Math.floor(Math.random(100)*100);
        io.emit('new message', {"msg": message, "cssTop": top, "cssLeft": left});
    });

    socket.on('disconnect', function() {
        numOfUsers--;
        io.emit('user count', numOfUsers);
        console.log("User disconnected, total: " + numOfUsers);
    });
});

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
