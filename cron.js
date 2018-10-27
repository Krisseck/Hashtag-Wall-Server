var instagram = require('./sources/instagram');
var twitter = require('./sources/twitter');

var config = require('./config');

twitter.updatePosts();

setInterval(instagram.updatePosts, config.instagram.update_interval);