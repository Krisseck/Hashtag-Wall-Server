var axios = require('axios');
var async = require('async');

var config = require('../config');

var databaseModels = require('../database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;
var DeletedPost = databaseModels.DeletedPost;
var IgnoredUser = databaseModels.IgnoredUser;

var handledPost = null;

module.exports = {
  updatePosts: function() {

    axios.post('https://www.instagram.com/graphql/query?query_hash=9b498c08113f1e09617a1703c22b2f32',
        {
          tag_name: config.hashtags.instagram,
          first: 50
        })
    .then(function(response) {

      if(Object.keys(response.data).length > 0) {

        async.eachSeries(response.data.data.hashtag.edge_hashtag_to_media.edges, updateSinglePost);

      }

    })
    .catch(function(e) {
      console.log(e);
    });

  }
}

function updateSinglePost(item, callback) {

  // Check if the user is set to be ignored

  IgnoredUser.findOne({
    where: {
      type: config.POST_TYPE_INSTAGRAM,
      source_id: item.node.owner.id
    }
  })
  .then(function(user) {

    if(!user) {

      // Check if post is in deleted_posts

      return DeletedPost.findOne({
        where: {
          type: config.POST_TYPE_INSTAGRAM,
          source_id: item.node.id
        }
      });
    } else {

      throw new Error('User set to be ignored');

    }
  })
  .then(function(post) {

    if(!post) {

      // Check if post already existed in db

      return Post.findOne({
        where: {
          type: config.POST_TYPE_INSTAGRAM,
          source_id: item.node.id
        }
      });


    } else {

      throw new Error('Post exists in deleted_posts');

    }
  })
  .then(function(post) {

    if(!post) {

      return Post.create({
        type: config.POST_TYPE_INSTAGRAM,
        source_id: item.node.id,
        link: 'https://instagram.com/p/' + item.node.shortcode,
        image: item.node.display_url,
        created_at: item.node.taken_at_timestamp * 1000,
        caption: item.node.edge_media_to_caption.edges[0].node.text
      });

    } else {

      throw new Error('Post already exists');

    }

  })
  .then(function(post) {

    handledPost = post;

    console.log('Created new Instagram post:', post.link);

    // Make sure the corresponding user is created

    return User.findOne({
      where: {
        type: config.POST_TYPE_INSTAGRAM,
        source_id: item.node.owner.id
      }
    });

  })
  .then(function(user) {

    if(user == null) {

      // Get the post JSON for user metadata

      return axios.post('https://www.instagram.com/graphql/query?query_hash=7c16654f22c819fb63d1183034a5162f',
          {
            user_id: item.node.owner.id,
            include_chaining: false,
            include_reel: true,
            include_suggested_users: false,
            include_logged_out_extras: false,
            include_highlight_reels: false
          });

    } else {

      handledPost.update({
        user_id: user.id
      });

      throw new Error('User already exists');

    }

  })
  .then(function(response) {

    if(Object.keys(response.data).length > 0) {

      return User.create({
        type: config.POST_TYPE_INSTAGRAM,
        source_id: response.data.data.user.reel.owner.id,
        avatar: response.data.data.user.reel.owner.profile_pic_url,
        username: response.data.data.user.reel.owner.username,
        display_name: response.data.data.user.reel.owner.username
      });

    } else {

      throw new Error('Post metadata is invalid');

    }

  })
  .then(function(user) {

    return handledPost.update({
      user_id: user.id
    });

  })
  .catch(function(e) {
    console.log(e);
  })
  .finally(callback);

}
