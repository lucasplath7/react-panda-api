import express from 'express';

import FdicController from './fdic.controller';
import httpUtil from '../../../utils/http-utils';

const router = express.Router();

router.get(
  '/env',
  httpUtil.asyncMiddleware(async (req, res) =>{
    httpUtil.sendSuccess(res, 'result: ')(process.env);
  })
);

router.get(
  '/getFedIds',
  httpUtil.asyncMiddleware(async (req, res) =>{
    const { fromPeriodDate, toPeriodDate } = req.query;
    const result = await FdicController.getFedIds(fromPeriodDate, toPeriodDate);

    httpUtil.sendSuccess(res, 'result: ')(result);
  })
);

router.get(
  '/getReportingPeriodEndDates',
  httpUtil.asyncMiddleware(async (req, res) =>{
    const result = await FdicController.getReportingPeriodEndDates();

    httpUtil.sendSuccess(res, 'result: ')(result);
  })
);

router.get(
  '/getCallReport',
  httpUtil.asyncMiddleware(async (req, res) =>{
    const { fedId, periodEndDate } = req.query;
    const result = await FdicController.getCallReport(fedId, periodEndDate);
    
    httpUtil.sendSuccess(res, 'result: ')(result);
  })
);

module.exports = router;