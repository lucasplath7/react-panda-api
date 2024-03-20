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
  })
);

module.exports = router;