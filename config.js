var models = require("./models.js");
var mongoose = require("mongoose");

var get = function(key, callback) {
    models.Config.findOne({key: key}, function(err, setting) {
        if(err) {
            console.error(err);
            callback(null);
        } else {
            if (setting)
                callback(setting.value);
            else
                callback(null);
        }
    })
}

var set = function(key, value, callback) {
    models.Config.update({key: key}, {value: value}, {upsert: true}, function(err, setting) {
        if(err)
            console.error(err)
        else
            callback();
    });
}

exports.get = get;
exports.set = set;
