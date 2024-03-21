import FdicCallReportApi from 'fdic-call-report-api';
require('dotenv');

async function getReportingPeriodEndDates() {
  try {
    const resp = await FdicCallReportApi.retrieveReportingPeriods(process.env.FDIC_USER, process.env.FDIC_KEY); 
    return resp;
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
}

async function getFedIds(fromPeriodDate, toPeriodDate) {
  return FdicCallReportApi.retrieveFilers(process.env.FDIC_USER, process.env.FDIC_KEY, fromPeriodDate, toPeriodDate);
}

async function getCallReport(fedId, periodEndDate){
  return FdicCallReportApi.retrieveCallReport(process.env.FDIC_USER, process.env.FDIC_KEY, fedId, periodEndDate);
}

module.exports = {
  getFedIds,
  getReportingPeriodEndDates,
  getCallReport,
}