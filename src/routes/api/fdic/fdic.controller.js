import FdicCallReportApi from 'fdic-call-report-api';

const FDIC_USER = 'lucasplath7'
const FDIC_KEY = 'z6B39AyyNusvILw9SyRY'


async function getReportingPeriodEndDates() {
  return FdicCallReportApi.retrieveReportingPeriods(FDIC_USER, FDIC_KEY);
}

async function getFedIds(fromPeriodDate, toPeriodDate) {
  return FdicCallReportApi.retrieveFilers(FDIC_USER, FDIC_KEY, fromPeriodDate, toPeriodDate);
}

async function getCallReport(fedId, periodEndDate){
  return FdicCallReportApi.retrieveCallReport(FDIC_USER, FDIC_KEY, fedId, periodEndDate);
}

module.exports = {
  getFedIds,
  getReportingPeriodEndDates,
  getCallReport,
}