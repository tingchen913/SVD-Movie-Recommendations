var engines = require("consolidate");
var express = require("express");
var http = require("http");
var logfmt = require("logfmt");
var os = require("os");
var url = require("url");

var app = express();
var server = http.createServer(app);

var mongo_url = url.parse(process.env.MONGOHQ_URL);

var io = require("socket.io").listen(server);

app.engine("html", engines.handlebars);
app.use(require("express-jquery")("/jquery.js"));
app.use(express.static(__dirname + "/public"));
app.use(logfmt.requestLogger());


app.get("/", function(req, res) {
    context = {
        request: req
    };
    res.render("index.html", context);
});


io.sockets.on('connection', function(socket) {
    console.log("Socket connected");
    socket.on("sendmessage", function(address) {
        console.log("hello");
        socket.emit("sendmessage", {my: "data"});
    });
});


var port = Number(process.env.PORT || 5555);

server.listen(port, function() {
    console.log("Listening on " + port);
});
