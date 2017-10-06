import * as express from 'express';
import { getTimers } from '../run';

/**
 * Render the export page to pick export options
 * 
 * @param req the request
 * @param res the response
 * @param next the next function
 */
function renderExportPage(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.render('export', { title: 'Scoop', options: {}, timers: getTimers() });
};

/**
 * Register export views
 * 
 * @param app the express app
 */
export function addExportRoutes(app: express.Application) {
  const router = express.Router();
  router.get('/', renderExportPage);
  app.use('/export', router);
}