import * as express from 'express';

import { getPosts, getJobs } from '../db';
import { filterEmoji } from '../util';

/**
 * Render a requested hashtag
 *
 * @param req the request
 * @param res the response
 * @param next the next function
 */
async function renderTagPage(req: express.Request, res: express.Response, next: express.NextFunction) {
  const posts = await getPosts(req.params.tag, 0, 20);

  const mapped = posts.map(r => ({
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

  res.render('preview', {
    title: req.params.tag,
    posts: mapped,
    filters: [
      'id',
      'date',
      'comments',
      'likes',
      'username',
      'full-name',
      'caption',
      'thumbnail'
    ]
  });
};

/**
 * Render the preview landing page with a list of hashtags
 *
 * @param req the request
 * @param res the response
 * @param next the next function
 */
async function renderLandingPage(req: express.Request, res: express.Response, next: express.NextFunction) {
  let jobs = await getJobs();
  if (!jobs) {
    jobs = [];
  }
  res.render('preview_landing', { title: 'Scoop', jobs: jobs});
};

/**
 * Register the preview request handlers
 * 
 * @param app the express app
 */
export function addPreviewRoutes (app: express.Application) {
  const router = express.Router();
  router.get('/:tag', renderTagPage);
  // router.get('/', renderLandingPage);
  app.use('/preview', router);
}

