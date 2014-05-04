var mongoose = require("mongoose");

var movieSchema = new mongoose.Schema({
    title: String,
    year: Number
});

var userSchema = new mongoose.Schema({
    _id: String,
    favorites: [mongoose.Schema.Types.ObjectId]
});

exports.Movie = mongoose.model("movies", movieSchema);
exports.User = mongoose.model("users", userSchema);
