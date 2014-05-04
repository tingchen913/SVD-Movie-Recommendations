var _ = require("lodash");
var cookie = require("cookie");
var crypto = require("crypto");
var engines = require("consolidate");
var express = require("express");
var http = require("http");
var logfmt = require("logfmt");
var models = require("./models.js");
var mongoose = require("mongoose");

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

require("./db.js").connect();

app.engine("html", engines.ejs);
app.use("/static", express.static(__dirname + "/public"));
app.use(express.cookieParser());
app.use(logfmt.requestLogger());


app.get("/", function(req, res) {
    var resultsCompiled = false;
    if (resultsCompiled) {
        context = {

        };
        res.render("results.html", context);
    } else {
        var userID;
        if (!("userID" in req.cookies)) {
            userID = crypto.randomBytes(10).toString("hex")
            res.cookie("userID", userID);
        } else {
            userID = req.cookies.userID;
        }

        models.User.findById(userID, function(err, user) {
            if (err) {
                console.error(err);
            } else {
                var favorites = [];
                if (user && ("favorites" in user))
                    favorites = _.map(user.favorites, function(f){return f.toHexString()});

                var moviesByYear = [];
                models.Movie.aggregate({$group: {_id: "$year", movies: {$addToSet: {title: "$title", _id: "$_id"}}}}, {$sort: {_id: -1}}).exec(function(err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        _.each(result, function(moviesOfYear) {
                            var movies = moviesOfYear.movies.sort(function(a, b){return a.title.replace(/^The /g, "") > b.title.replace(/^The /g, "")});
                            for (var i = 0; i < movies.length; ++i) {
                                if (_.contains(favorites, movies[i]._id.toString())) {
                                    movies[i].favorited = true;
                                } else {
                                    movies[i].favorited = false;
                                }
                            };

                            moviesByYear.push({
                                year: moviesOfYear._id,
                                movies: movies
                            });
                        });



                        context = {
                            request: req,
                            moviesByYear: moviesByYear,

                        };
                        res.render("choose_favorites.html", context);
                    };
                });
            }
        });

    }
});

io.sockets.on("connection", function(socket) {
    console.log("Socket connected");
    var userID = cookie.parse(socket.handshake.headers.cookie)["userID"];

    socket.on("addFavorite", function(movieID, callback) {
        if (userID) {
            models.User.update({_id: userID}, {$addToSet: {favorites: movieID}}, {upsert: true}, function(err){
                if (err) {
                    console.error("Error adding favorite: " + err);
                    callback("Error adding favorite: " + err);
                } else {
                    console.log("Favorite " + movieID + " added for user " + userID);
                    callback("Favorite " + movieID + " added");
                }
            });
        } else {
            console.error("No 'userID' cookie set");
            callback("No 'userID' cookie set");
        }
    });

    socket.on("removeFavorite", function(movieID, callback) {
        if (userID) {
            models.User.update({_id: userID}, {$pull: {favorites: movieID}}, {upsert: true}, function(err){
                if (err) {
                    console.error("Error removing favorite: " + err);
                    callback("Error removing favorite: " + err);
                } else {
                    console.log("Favorite " + movieID + " removed for user " + userID);
                    callback("Favorite " + movieID + " removed");
                }
            });
        } else {
            console.error("No 'userID' cookie set");
            callback("No 'userID' cookie set");
        }
    });

});

var port = Number(process.env.PORT || 5555);
server.listen(port, function() {
    console.log("Listening on " + port);
});
