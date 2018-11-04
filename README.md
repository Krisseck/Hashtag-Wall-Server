# Hashtag Wall Server

[![Hashtag Wall Client Example](https://github.com/Krisseck/Hashtag-Wall-Client/blob/master/hashtag-wall-example.jpg)](http://hashtag.polso.info)

[![dependencies](https://david-dm.org/Krisseck/Hashtag-Wall-Server.svg)](https://david-dm.org/Krisseck/Hashtag-Wall-Server) [![travis-ci](https://travis-ci.org/Krisseck/Hashtag-Wall-Server.svg?branch=master)](https://travis-ci.org/Krisseck/Hashtag-Wall-Server) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Krisseck/Hashtag-Wall-Server/issues)

Hashtag wall that displays posts from several social media sources. You can specify the hashtag to monitor and the server collects these posts.

This is the server component of the wall. It's a node.js express server that provides a JSON API for displaying the social media posts.

## Demo

Client: http://hashtag.polso.info

API: http://hashtag.polso.info:8080/posts

Admin: http://hashtag.polso.info:8080/admin (username: admin, password: password)

## Features

* Cron process that fetches the social media posts
* Supports multiple social media platforms (currently Instagram & Twitter)
* Admin interface for displaying and deleting posts
* Ignore specific user's posts

## Requirements

* Tested with **Node.js v10.13.0 (LTS)**, should work with other 10.x versions aswell.
* [Yarn](https://yarnpkg.com/)
* MySQL-server


## Install

Run `yarn`to install dependencies

Copy `config.js.example` to `config.js` and change the values as needed.

To install database tables, run:

`node install-dbs.js`

**Note:** Running this script will drop the tables if already existing!

## Running the server ##

`app.js` is the main API server.

`cron.js` is the background process that fetches the social media posts. 

You can run these scripts with just `node app.js` and `node cron.js`, although I recommend using a process manager like [PM2](https://pm2.io/). Then the commands will be:

```
pm2 start app.js
pm2 start cron.js
```
