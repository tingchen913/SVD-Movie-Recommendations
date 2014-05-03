var secret = require("./secret.js");
var url = require("url");
var mongo_url = url.parse(secret.MONGOHQ_URL);
console.log(mongo_url);
