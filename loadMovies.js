var cheerio = require("cheerio");
var crypto = require("crypto");
var fs = require("fs");
var http = require("http");
var models = require("./models.js");
var mongoose = require("mongoose");


require("./db.js").connect();

var url = "http://www.imdb.com/chart/top?sort=rd,desc&mode=simple";
http.get(url, function(result) {
    var html = "";

    result.on("data", function(chunk) {
        html += chunk;
    });

    result.on("end", function() {
        $ = cheerio.load(html);
        $(".lister-list tr").each(function(i, elem) {
            var title = $(".titleColumn a", this).text();
            var year = $(".titleColumn .secondaryInfo", this).text().replace(/[^\d]/g,"");
            var imdbURL = $(".posterColumn img", this).attr("src");
            var id = mongoose.Types.ObjectId();
            var filename = id.toString() + ".jpg";

            http.get(imdbURL, function(imgResult) {
                var data = "";
                imgResult.setEncoding("binary");
                imgResult.on("data", function(chunk) {
                    data += chunk;
                });
                imgResult.on("end", function() {
                    fs.writeFile("./public/posters/" + filename, data, "binary", function(err){
                        if (err) console.log(err);
                        else console.log("File " + filename + " saved");
                    })
                })

            }).on("error", function(e) {
                console.log(e.message);
            })

            var movie = new models.Movie({
                title: title,
                year: year,
                _id: id
            });

            movie.save(function (err) {
                if (err)
                    console.log("Error saving model: " + err);
                else
                    console.log("Saved model");
            });
        });
    });

}).on("error", function(e) {
    console.log(e.message);
});
