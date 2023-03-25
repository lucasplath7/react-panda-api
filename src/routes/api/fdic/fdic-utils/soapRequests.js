const parseString = require('xml2js').parseString;
const soapRequest = require('easy-soap-request');
const fs = require('fs');

var ParseXbrl = require('parse-xbrl');

require('dotenv').config();

const RETRIEVE_PERIODS = 'http://cdr.ffiec.gov/public/services/RetrieveReportingPeriods';
const RETRIEVE_FILERS = 'http://cdr.ffiec.gov/public/services/RetrieveFilersSinceDate';
const RETRIEVE_REPORT = 'http://cdr.ffiec.gov/public/services/RetrieveFacsimile';
 
// const username = process.env.FDIC_USERNAME;
// const passwordText = process.env.FDIC_PASSWORD;
const username = 'lucasplath7'
const passwordText = 'Kw4qRxAxeCp2erFmJXM7'
const url = 'https://cdr.ffiec.gov/Public/PWS/WebServices/RetrievalService.asmx?WSDL';
const createHeader = (soapAction) => {
    return {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': soapAction,
      'Host': 'cdr.ffiec.gov',
    }
};
const createXml = (username, passwordText, body) => {
  return `<?xml version="1.0" encoding="utf-8"?>
          <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	        <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
	          <wsse:Security soap:mustUnderstand="true" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
		        <wsse:UsernameToken>
			      <wsse:Username>${username}</wsse:Username>
			      <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${passwordText}</wsse:Password>
		        </wsse:UsernameToken>
	          </wsse:Security>
            </soap:Header>
            <soap:Body>
              ${body}
            </soap:Body>
          </soap:Envelope>`;
}

async function retrieveReportingPeriods() {
  const methodBody = `<RetrieveReportingPeriods xmlns="http://cdr.ffiec.gov/public/services">
                        <dataSeries>Call</dataSeries>
                      </RetrieveReportingPeriods>`;
  const xml = createXml(username, passwordText, methodBody);
  const header = createHeader(RETRIEVE_PERIODS);
  const { response } = await soapRequest({ url: url, headers: header, xml: xml, timeout: 10000});
  const dates = response.body.substring(
      response.body.indexOf('<RetrieveReportingPeriodsResult>') + 32,
      response.body.indexOf('</RetrieveReportingPeriodsResult>')
    )
    .replace(/<string>/g, '')
    .replace(/<\/string>/g, ',')
    .split(',');

  return dates.filter(value => value);
}

async function retrieveFilers(fromPeriodDate, toPeriodDate) {
  const methodBody = `<RetrieveFilersSinceDate xmlns="http://cdr.ffiec.gov/public/services"><dataSeries>Call</dataSeries><reportingPeriodEndDate>${toPeriodDate}</reportingPeriodEndDate><lastUpdateDateTime>${fromPeriodDate}</lastUpdateDateTime></RetrieveFilersSinceDate>`;
  const xml = createXml(username, passwordText, methodBody);
  const header = createHeader(RETRIEVE_FILERS)
  const { response } = await soapRequest({ url: url, headers: header, xml: xml, timeout: 30000 });

  const filers = response.body.substring(
      response.body.indexOf('<RetrieveFilersSinceDateResult>') + 31,
      response.body.indexOf('</RetrieveFilersSinceDateResult>')
    )
    .replace(/<int>/g, '')
    .replace(/<\/int>/g, ',')
    .split(',');

  return filers.filter(value => value);
}

async function retrieveCallReport(fedId, periodEndDate){
  const methodBody = `<RetrieveFacsimile xmlns="http://cdr.ffiec.gov/public/services"><dataSeries>Call</dataSeries><reportingPeriodEndDate>${periodEndDate}</reportingPeriodEndDate><fiIDType>ID_RSSD</fiIDType><fiID>${fedId}</fiID><facsimileFormat>XBRL</facsimileFormat></RetrieveFacsimile>`;
  const xml = createXml(username, passwordText, methodBody);
  const header = createHeader(RETRIEVE_REPORT)
  
  const { response } = await soapRequest({ url: url, headers: header, xml: xml, timeout: 30000 });


  const base64 = response.body.substring(
    response.body.indexOf('<RetrieveFacsimileResult>') + 25,
    response.body.indexOf('</RetrieveFacsimileResult>')
  );

  let buff = new Buffer(base64, 'base64');  
  let text = buff.toString('utf-8');

  let report = {};
  
  parseString(text, function(err,result){
    Object.keys(result.xbrl).forEach(key => {
      if(key.includes('cc:')) {
        report[key.replace('cc:', '')] = result.xbrl[key][0]._;
      }
    })
  });

  return report;
}

module.exports = {
  retrieveReportingPeriods,
  retrieveFilers,
  retrieveCallReport
}
