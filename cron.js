var instagram = require('./sources/instagram');
var twitter = require('./sources/twitter');

var config = require('./config');

if(config.hashtags.twitter != '') {

  console.log('Enabled Twitter feed');

  twitter.updatePosts();

}

if(config.hashtags.instagram != '') {

  console.log('Enabled Instagram feed');

  setInterval(instagram.updatePosts, config.instagram.update_interval);

}