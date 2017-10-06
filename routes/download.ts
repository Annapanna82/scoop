import * as express from 'express';
import * as _ from 'lodash';
import { filterEmoji } from '../util';


import {getPosts, getPostsWithEmail} from '../db';
import {IPost} from '../interfaces';

function getHeader (requested) {
  return requested.join(',');
}

function getRow (requested, obj) {
  return requested.map(r => obj !== undefined ? `"${obj[r]}"` : "")
    .join(',');
}

/**
 * Generate a CSV with the requested fields
 * 
 * @param req the request
 * @param res the response
 * @param next the next function
 */
async function handleDownloadRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const tag = req.query.tag;

  let result: Array<IPost> = [];

  if (req.query.filter_email) {
    result = (await getPostsWithEmail(tag)) as Array<IPost>;
  } else {
    result = (await getPosts(tag)) as Array<IPost>;
  }

  if (req.query.filter_duplicates) {
    result = _.uniqBy(result, r => r.owner.id);
  }

  // lazy mode, doesn't really require lodash
  _.unset(req.query, 'submit');
  _.unset(req.query, 'tag');
  _.unset(req.query, 'filter_email');
  _.unset(req.query, 'filter_duplicates');
  const requested = Object.getOwnPropertyNames(req.query);

  // Do some processing of the results and then
  // use lodash pick to grab only the requested properties
  const mapped = result.map(r => ({
    post_id: r._id,
    width: r.dimensions.width,
    height: r.dimensions.height,
    comments: r.comments.count,
    likes: r.likes.count,
    is_ad: r.is_ad,
    caption: filterEmoji(r.caption),
    date: new Date(r.date * 1000).toISOString(),
    display_src: r.display_src,
    owner_username: filterEmoji(r.owner.username),
    owner_follows: r.owner.follows.count,
    owner_followed: r.owner.followed_by.count,
    owner_profile_hd: r.owner.profile_pic_url_hd,
    owner_profile: r.owner.profile_pic_url,
    owner_biography: filterEmoji(r.owner.biography),
    owner_full_name: filterEmoji(r.owner.full_name),
    owner_media: r.owner.media.count,
    owner_email: r.owner.email,
    owner_external_url: r.owner.external_url
  }))
  .map(r => _.pick(r, requested));

  // Create a simple csv header
  const header = getHeader(requested);


  const csv = mapped.map(r => getRow(requested, r));
  csv.unshift(header);

  res.contentType('text/csv');
  res.send(csv.join('\n'));
};


/**
 * Register download routes that handle CSV generation
 * @param app express app
 */
export function addDownloadRoutes(app: express.Application) {
  const router = express.Router();
  router.get('/', handleDownloadRequest);
  app.use('/download', router);
}
