var _ = require("lodash");
var models = require("./models.js");
var numeric = require("numeric");

require("./db.js").connect();

var getColumns = function(M, k) {
    return numeric.getBlock(M, [0 ,0], [M.length-1, k-1]);
}

var processData = function(movies, users, callback) {
    // M[movie][user] = favorited

    if (users.length == 0)
        return;
    
    var movieIdToIndex = {};
    var indexToMovieId = {};
    var index = 0;
    _.each(movies, function(m) {
        movieIdToIndex[m._id.toString()] = index;
        indexToMovieId[index++] = m._id.toString();
    });

    var userIdToIndex = {};
    var indexToUserId = {};
    index = 0;
    _.each(users, function(u) {
        userIdToIndex[u._id.toString()] = index;
        indexToUserId[index++] = u._id.toString();
    });


    var M = new Array(movies.length);
    for (var i = 0; i < movies.length; i++) {
        M[i] = _.map(new Array(users.length), function(){
            return 0;
        });
    };

    for (var u = 0; u < users.length; u++) {
        _.each(users[u].favorites, function(m) {
            var i = movieIdToIndex[m.toString()];
            if (i != -1)
                M[i][u] = 1;
        });
    }

    var res = numeric.svd(M);
    var k = 2;

    var U = getColumns(res.U, k);
    var S = numeric.diag(res.S.slice(0, k));
    var VT = getColumns(res.V, k);

    var str = function(e){return e.toString()};

    models.User.update({}, {$unset: {recommendations: ""}}, {multi: true}, function(err, val) {
        if (err) {
            console.error(err);
        } else {
            for(var i = 0 ; i < VT.length; ++i) {
                var u1 = VT[i];
                var u1recs = [];
                for(var j = 0; j < VT.length; ++j) {
                    if (i != j) {
                        var u2 = VT[j];

                        var cosineSimilarity = (1.0*(u1[0]*u2[0] + u1[1]*u2[1]))/(Math.sqrt((u1[0]*u1[0] + u1[1]*u1[1])*(u2[0]*u2[0] + u2[1]*u2[1])).toFixed(3));
                        if (cosineSimilarity > 0.9) {
                            var recs = _.difference(users[j].favorites.map(str), users[i].favorites.map(str));
                            u1recs = u1recs.concat(recs);
                        }
                    }
                }

                u1recs = _.uniq(u1recs);

                u1recs.sort(function(a, b) {
                    var aTotal = M[movieIdToIndex[a]].reduce(function(sum, num){return sum+num});
                    var bTotal = M[movieIdToIndex[b]].reduce(function(sum, num){return sum+num});
                    return aTotal - bTotal;
                });

                models.User.update({_id:indexToUserId[i]}, {$addToSet: {recommendations: {$each: u1recs}}}, function(err, val) {
                    if (err) {
                        console.error(err);
                    }
                });
            }

            callback();
        }
    });

}


var generateRecommendations = function(callback) {
    models.Movie.find({}, function(err, movies) {
        if (err) {
            console.error(error);
        } else {
            models.User.find({}, function(err, users) {
                if (err) {
                    console.error(error);
                } else {
                    processData(movies, users, callback);
                }
            });
        }
    });
}

exports.generateRecommendations = generateRecommendations;
