import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';

import { setRoutes } from './routes';

require('dotenv').config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public/views'));
app.use(require('body-parser').json());
app.use(
  session({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false
  })
);
// This is requiring session to be set on all routes.  How do I prevent so that
// users can access public areas without being logged in
// app.use((req, res, next) => {
//   if (req.session.user) {
//     next();
//   } else {
//     res.status(401).send('Authrization failed! Please login');
//   }
// });

setRoutes(app);

export default app;