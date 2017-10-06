# Scoop #

## A proof of concept Instagram scraper ##

This is a simple node app that polls Instagram hashtags and
stores the post data (no images) for later use. This can be used
to implement Instagram widgets, image walls etc.

As this is a proof of concept there's little to no error handling
and no optimizations. Data is stored in MongoDB as a document with no concern
for optimizations for query speed, storage size etc.

#### Why? ####
Because it's possible

#### Why release it? ####
To inspire developers to tinker and explore ways to solve
problems in unconventional ways.

#### Can I run this in production? ####
Sure, if you really want to. Expect things to break and requiring fixes.

### How do I get started? ###
1. Install MongoDB, it's expected on localhost
1. Clone repo
1. `npm install`
1. `npm start`
1. Browse to localhost:3000