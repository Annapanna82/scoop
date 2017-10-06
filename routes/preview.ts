import * as express from 'express';

import { getPosts, getJobs } from '../db';

/**
 * Render a requested hashtag
 * 
 * @param req the request
 * @param res the response
 * @param next the next function
 */
async function renderTagPage(req: express.Request, res: express.Response, next: express.NextFunction) {
  const posts = await getPosts(req.params.tag, 0, 20);
  res.render('preview', { 
    title: req.params.tag, 
    posts: posts,
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
  router.get('/', renderLandingPage);
  app.use('/preview', router);
}

