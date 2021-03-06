import * as express from 'express';
import {startTimer, getTimers, stopTimer} from '../run';
import { getPosts, getJobs } from '../db';

/**
 * Render the index page where running timers are displayed
 * and timers can be started and stopped
 *
 * @param req the request
 * @param res the response
 * @param next the next function
 */

async function renderIndexPage(req: express.Request, res: express.Response, next: express.NextFunction) {
  let jobs = await getJobs();
  if (!jobs) {
    jobs = [];
  }
  res.render('index', {
      title: 'Scoop',
      blobs: [],
      timers: getTimers(),
      jobs: jobs
  });
};

/**
 * Start a timer for the requested hashtag and type
 *
 * @param req the request
 * @param res the response
 * @param next the next function
 */
function handleStartRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const tag = req.body.tag.replace('#', '')
  const opts = {
    tag: tag,
    type: 'watch'
  };
  startTimer(opts);
  res.redirect('/');
};

/**
 * Stop a timer for the requested hashtag and type
 *
 * @param req the request
 * @param res the response
 * @param next the next function
 */
function handleStopRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  Object.keys(req.body).forEach(k => {
    console.log(k);
    const n = k.split('|');
    stopTimer(n[0], n[1]);
  });
  res.redirect('/');
};

/**
 * Registers handlers for the index page
 *
 * @param app the express app
 */
export function addDefaultRoutes (app: express.Application) {
  const router = express.Router();
  router.get('/', renderIndexPage);
  router.post('/search', handleStartRequest);
  router.post('/stop', handleStopRequest);
  app.use('/', router);
  app.use('/search', router);
}
