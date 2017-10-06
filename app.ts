import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { addDefaultRoutes } from './routes/index';
import { addDownloadRoutes } from './routes/download';
import { addExportRoutes } from './routes/export';
import { addPreviewRoutes } from './routes/preview';
import { addApiRoutes } from './routes/api';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

addDefaultRoutes(app);
addPreviewRoutes(app);
addExportRoutes(app);
addDownloadRoutes(app);
addApiRoutes(app);

class MyError extends Error {
  status: number;
}
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new MyError('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
