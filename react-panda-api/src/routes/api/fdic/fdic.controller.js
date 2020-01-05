import bcrypt from 'bcrypt';
import soapUtil from './fdic-utils/soapRequests';

async function getFedIds(fromPeriodDate, toPeriodDate) {
  return soapUtil.retrieveFilers(fromPeriodDate, toPeriodDate);
}

async function getReportingPeriodEndDates() {
  return soapUtil.retrieveReportingPeriods();
}

async function getCallReport(fedId, periodEndDate){
  return soapUtil.retrieveCallReport(fedId, periodEndDate);
}

module.exports = {
  getFedIds,
  getReportingPeriodEndDates,
  getCallReport,
}