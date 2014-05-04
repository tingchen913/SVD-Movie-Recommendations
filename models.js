var mongoose = require("mongoose");

var movieSchema = new mongoose.Schema({
    title: String,
    year: Number
});

exports.Movie = mongoose.model("movies", movieSchema);
