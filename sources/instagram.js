var requestPromise = require('request-promise');
var md5 = require('md5');
var async = require('async');

var config = require('../config');

var databaseModels = require('../database-models');

var Post = databaseModels.Post;
var User = databaseModels.User;
var DeletedPost = databaseModels.DeletedPost;
var IgnoredUser = databaseModels.IgnoredUser;

var rhx_gis = null;

var handledPost = null;

module.exports = {
  updatePosts: function() {

    // Get homepage for rhx_gis

    requestPromise({
      method: 'GET',
      url: 'https://www.instagram.com/',
    })
    .then(function(body) {

      rhx_gis = body.substring(body.lastIndexOf("\"rhx_gis\":\"")+11, body.lastIndexOf("\",\"nonce\""));

      if(rhx_gis != null) {

        return requestPromise({
          method: 'GET',
          url: 'https://www.instagram.com/explore/tags/'+config.hashtags.instagram+'/?__a=1',
          headers: {
            'x-instagram-gis': md5(rhx_gis+":/explore/tags/"+config.hashtags.instagram+"/")
          }
        });

      } else {

        throw new Error('Could not get rhx_gis');

      }

    })
    .then(function(body) {

      var postsJson = {};

      try {
        postsJson = JSON.parse(body);
      } catch (e) {
        throw new Error('Failed to parse JSON');
      }

      if(Object.keys(postsJson).length > 0) {

        async.eachSeries(postsJson.graphql.hashtag.edge_hashtag_to_media.edges, updateSinglePost);

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

      return requestPromise({
        method: 'GET',
        url: 'https://www.instagram.com/p/'+item.node.shortcode+'/?__a=1',
        headers: {
          'x-instagram-gis': md5(rhx_gis+":/p/"+item.node.shortcode+"/")
        }
      });

    } else {

      handledPost.update({
        user_id: user.id
      });

      throw new Error('User already exists');

    }

  })
  .then(function(body) {

    var postMetadataJson = {};

    try {
      postMetadataJson = JSON.parse(body);
    } catch (e) {
      throw new Error("Failed to parse JSON for single post " + item.node.shortcode);
    }

    if(Object.keys(postMetadataJson).length > 0) {

      return User.create({
        type: config.POST_TYPE_INSTAGRAM,
        source_id: postMetadataJson.graphql.shortcode_media.owner.id,
        avatar: postMetadataJson.graphql.shortcode_media.owner.profile_pic_url,
        username: postMetadataJson.graphql.shortcode_media.owner.username,
        display_name: postMetadataJson.graphql.shortcode_media.owner.full_name
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