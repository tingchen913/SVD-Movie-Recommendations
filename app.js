var _ = require("lodash");
var engines = require("consolidate");
var express = require("express");
var http = require("http");
var logfmt = require("logfmt");
var models = require("./models.js");
var mongoose = require("mongoose");

// Set up app
var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

// Connect to MongoDB
require("./db.js").connect();

// Configure server
app.engine("html", engines.ejs);
app.use("/static", express.static(__dirname + "/public"));
app.use(logfmt.requestLogger());


// Routes
app.get("/", function(req, res) {
    var resultsCompiled = false;
    if (resultsCompiled) {
        context = {

        };
        res.render("results.html", context);
    } else {
        var moviesByYear = [];
        models.Movie.aggregate({$group: {_id: "$year", movies: {$addToSet: {title: "$title", _id: "$_id"}}}}, {$sort: {_id: -1}}).exec(function(err, result) {
            if (err) {
                console.log(err);
            } else {
                _.each(result, function(moviesOfYear) {
                    moviesByYear.push({
                        year: moviesOfYear._id,
                        movies: moviesOfYear.movies.sort(function(a, b){return a.title.replace(/^The /g, "") > b.title.replace(/^The /g, "")})
                    });
                });

                context = {
                    request: req,
                    moviesByYear: moviesByYear
                };
                res.render("choose_favorites.html", context);
            };
        });

    }
});


// Socket setup
io.sockets.on("connection", function(socket) {
    console.log("Socket connected");
    socket.on("sendmessage", function(address) {
        socket.emit("sendmessage", {my: "data"});
    });
});


// Start server
var port = Number(process.env.PORT || 5555);
server.listen(port, function() {
    console.log("Listening on " + port);
});
