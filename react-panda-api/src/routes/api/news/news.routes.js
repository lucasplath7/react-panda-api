import express from 'express';

import NewsController from './news.controller';
import httpUtil from '../../../utils/http-utils';

const router = express.Router();

router.get(
  '/getFeeds',
  httpUtil.asyncMiddleware(async (req, res) =>{
    // const { source } = req.query;
    const result = await NewsController.getFeeds();
console.log('OGT HERE!!!!!!!!!!!!!!')
    httpUtil.sendSuccess(res, 'result: ')(result);
  })
);

module.exports = router;