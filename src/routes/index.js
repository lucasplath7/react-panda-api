import express from 'express';
import FdicRoutes from './api/fdic';
import NewsRoutes from './api/news';

const router = express.Router();

function setCORS(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-User');
  if(req.method === 'OPTIONS') {
    res.status(200).end();
  }
  // else {
  //   next();
  // }
  next();
}

router.get('/test', (req,res) => res.json('Test Response Output Success'));
router.use('/api/fdic', FdicRoutes.routes);
router.use('/api/news', NewsRoutes.routes);

export function setRoutes(app) {
  app.all('/*', setCORS);
  app.use('/', router);
}

export function listRoutes( routes, stack, parent) {
  const p = parent || '';

  if(stack) {
    stack.forEach((r) => {
      if (r.route && r.route.path) {
        Object.entries(r.route.methods).forEach(([key, value]) => {
          if (value) {
            routes.push({ method: key.toUpperCase(), path: p + r.route.path });
          }
        })
      } else if (r.handle && r.handle.name === 'router') {
        const routerName = r.regexp.source.replace('^\\', '').replace('\\', '').replace('\\/?(?=\\/|$)', '');
        listRoutes(routes, r.handle.stack, p + routerName);
      }
    });
    console.log(routes);
    return routes;
  }
  return listRoutes([], router.stack);
}

router.get('/', (req, res) => {
  res.render('index', { title: 'POC Server', routes: listRoutes() });
});
