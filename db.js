var mongoose = require("mongoose");

var connect = function(fn) {
    var mongoUri = process.env.MONGOHQ_URL;
    mongoose.connect(mongoUri, function(err, rs) {
        if (err) {
            console.log("Error connecting to: " + mongoUri + ". " + err);
        } else {
            console.log("Successfully connected to MongoDB");
        }
    });

    mongoose.connection.on("error", function(err) {
        console.log(err);
    });

    mongoose.connection.on("disconnected", function() {
        connect();
    });
};

exports.connect = connect;
