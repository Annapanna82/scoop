
import * as express from 'express';

import { getPosts } from '../db';

/**
 * Handle an api request for a hashtag
 * 
 * @param req the request
 * @param res the response
 * @param next next function
 */
async function handleTagRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const offset = parseInt(req.param('offset', '0'));
  const limit = parseInt(req.param('limit', '20'));

  const posts = await getPosts(req.params.tag, offset, limit);

  const results = posts.map(p => ({
    id: p.id,
    username: p.owner.username,
    profile_pic: p.owner.profile_pic_url,
    profile_pic_hd: p.owner.profile_pic_url_hd,
    caption: p.caption,
    profile_url: `https://instagram.com/${p.owner.username}`,
    image: p.display_src
  }));
  res.json(results);
}

/**
 * Register routes related to the api
 * 
 * @param app the express application
 */
export function addApiRoutes(app: express.Application) {
  var router = express.Router();

  router.get('/tag/:tag', handleTagRequest);

  app.use('/api', router);
};

