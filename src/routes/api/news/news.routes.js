import express from 'express';

import NewsController from './news.controller';
import httpUtil from '../../../utils/http-utils';

const router = express.Router();

router.get(
  '/getFeeds',
  httpUtil.asyncMiddleware(async (req, res) => {
    try {
      const result = await NewsController.getFeeds();
      httpUtil.sendSuccess(res, 'result: ')(result.flat());
    } catch (err) {
      console.log('error: ', err);
      throw new Error(err);
    }
      
      // httpUtil.sendSuccess(res, 'result: ')(result.flat());
  })
);

router.get(
  '/getTest',
  httpUtil.asyncMiddleware(async (req, res) => {
      const result = await NewsController.getTest();
      
      httpUtil.sendSuccess(res, 'result: ')(result);
  })
);

module.exports = router;