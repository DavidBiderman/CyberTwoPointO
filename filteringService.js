const fs = require('fs');
const log = require('./logger');


async function filterRequest(source, dest, port, payload){
  
  writeLegitimateRequest(source, dest, port, payload);
}

function writePortScanAttempt(source, dest, port, payload){
  log.error(`Port scan attempt from ${source} to ${dest}:${port} with payload ${JSON.stringify(payload)}`);
  log.error('**ADD HISTORY HERE**');
}

function writeLegitimateRequest(source, dest, port, payload){
  log.info(`Legitimate request from ${source} to ${dest}:${port}`);
}

// Execute if ran directly for simple testing and debuging
if (typeof require !== 'undefined' && require.main === module) {

}

module.exports = filterRequest;