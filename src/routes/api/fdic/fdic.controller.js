import FdicCallReportApi from 'fdic-call-report-api';

const FDIC_USER = 'lucasplath7'
const FDIC_KEY = 'Ibn55syli2PCex0mEddf'


async function getReportingPeriodEndDates() {
  try {
    const resp = await FdicCallReportApi.retrieveReportingPeriods(FDIC_USER, FDIC_KEY); 
    return resp;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
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