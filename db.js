var mongoose = require("mongoose");

var connect = function() {
    var mongoUri = process.env.MONGO_URL;
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
        console.error("Disconnected from MongoDB! Reconnecting...");
        connect();
    });
};

exports.connect = connect;
