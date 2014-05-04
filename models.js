var mongoose = require("mongoose");

var movieSchema = new mongoose.Schema({
    title: String,
    year: Number
});

var userSchema = new mongoose.Schema({
    _id: String,
    favorites: [mongoose.Schema.Types.ObjectId]
});

var configSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
});


exports.Movie = mongoose.model("Movie", movieSchema);
exports.User = mongoose.model("User", userSchema);
exports.Config = mongoose.model("Config", configSchema, "config");
