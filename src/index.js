import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';

import { setRoutes } from './routes';

require('dotenv').config();

const app = express();

app.use(function setCommonHeaders(req, res, next) {
  res.set("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public/views'));
app.use(require('body-parser').json());
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false
  })
);

setRoutes(app);

export default app;