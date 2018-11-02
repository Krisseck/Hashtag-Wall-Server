var config = require('../config');

var databaseModels = require('../database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;
var DeletedPost = databaseModels.DeletedPost;
var IgnoredUser = databaseModels.IgnoredUser;

var Twit = require('twit');

var T = new Twit({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token: config.twitter.access_token,
  access_token_secret: config.twitter.access_token_secret
});

module.exports = {

  updatePosts: function() { 

    var stream = T.stream('statuses/filter', {track: config.hashtags.twitter});

    stream.on('tweet', createTweet);

  }

}

function createTweet(tweet) {

  var postDate = new Date(tweet.created_at);

  var image = '';

  if(typeof tweet.entities.media != "undefined" && tweet.entities.media[0].type=="photo") {

    image = tweet.entities.media[0].media_url;

  }

  if(typeof tweet.retweeted_status != "undefined") {

    // Is a retweet, skip

    return 1;

  }

  // Check if user is set to be ignored

  IgnoredUser.findOne({
    where: {
      type: config.POST_TYPE_TWITTER,
      source_id: tweet.user.id
    }
  })
  .then(function(user) {

    if(!user) {

      // Check if post is in deleted_posts

      return DeletedPost.findOne({
        where: {
          type: config.POST_TYPE_TWITTER,
          source_id: tweet.id_str
        }
      });

    } else {

      throw new Error('User set to be ignored');

    }
  })
  .then(function(post) {

    if(!post) {

      return Post.create({
        type: config.POST_TYPE_TWITTER,
        source_id: tweet.id_str,
        link: 'https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str,
        image: image,
        created_at: postDate.getTime(),
        caption: tweet.text
      })

    } else {

      throw new Error('Post is in deleted_posts');

    }
  })
  .then(function(post) {

    console.log('Created new Twitter post:', post.link);

    handledPost = post;

    // Make sure the corresponding user is created

    return User.findOne({
      where: {
        type: config.POST_TYPE_TWITTER,
        source_id: tweet.user.id
      }
    });

  })
  .then(function(user) {

    if(user == null) {

      // Create user

      return User.create({
        type: config.POST_TYPE_TWITTER,
        source_id: tweet.user.id,
        avatar: tweet.user.profile_image_url_https,
        username: tweet.user.screen_name,
        display_name: tweet.user.name
      });

    } else {

      handledPost.update({
        user_id: user.id
      });

      throw new Error('User already exists');

    }

  })
  .then(function(user) {

    return handledPost.update({
      user_id: user.id
    });

  })
  .catch(function(e) {
    console.log(e);
  });
}
