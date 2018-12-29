const fs = require('fs');
const log = require('./logger');
const cacheService = require('./util/services/cache-service');

// all messages are sent with latency to ensure that no single ip can send a single message if it is sending more requests than we consider acceptable
async function filterRequest(source, dest, port, payload){
  // check if source is in redis blacklist (deny + report / continue)
  try {
    if (await _isBlacklistedSource(source)) { 
      const sourceObj = { 
        source: source,
        messages: [{
          dest: dest,
          port: port,
          payload: payload
        }]
      };
      writePortScanAttempt(source, sourceObj);
      return;
    } else { //check if source is in active tracked list
      let sourceObj = await _isActiveAndTracked(source);
      if (sourceObj) { // if tracked add another message to the message array
        _updateSourceRequestCount(sourceObj, dest, port, payload);
      } else { // insert the timeout frame, check when time expires
        _addToActiveList(source, { source: source, messages: [{ dest: dest, port: port, payload: payload }] });
        setTimeout(async function () {
          const sourceObj = await _isActiveAndTracked(source);
          if (sourceObj && await _isValidSource(sourceObj)) { // Verify that source is valid and can send a message
            // fetch messages, and erase from active member list
            writeLegitimateRequest(source, sourceObj);
          } else {
            _addToBlacklist(source);
            writePortScanAttempt(source, sourceObj);
          }
          _removeFromActiveList(source);
        }, process.env.TIMEOUT);
      }
    }  
  } catch (error) {
    
  }
  
}

function writePortScanAttempt(source, sourceObj){
  if(sourceObj.messages.length){
    const portScanMessage = sourceObj.messages.shift();
    _writePortScanAttempt(source, portScanMessage.dest, portScanMessage.port, portScanMessage.payload);
    writePortScanAttempt(source, sourceObj);
  }
}

function _writePortScanAttempt(source, dest, port, payload){
  log.error(`Port scan attempt from ${source} to ${dest}:${port} with payload ${JSON.stringify(payload)}`);
  log.error('**ADD HISTORY HERE**');
}

function writeLegitimateRequest(source, sourceObj){
    if(sourceObj.messages.length){
      const messageToSend = sourceObj.messages.shift();
      _writeLegitimateRequest(source, messageToSend.dest, messageToSend.port, messageToSend.payload);
      writeLegitimateRequest(source, sourceObj)
    }
}

function _writeLegitimateRequest(source, dest, port, payload){
  log.info(`Legitimate request from ${source} to ${dest}:${port}`);
}

function _isBlacklistedSource(source){
  return cacheService.fetchBlacklistedMember(source);
}

async function _isActiveAndTracked(source){
  return await cacheService.fetchActiveMember(source);
}

function _addToActiveList(newSource, data){
  cacheService.createOrUpdateActiveMember(newSource, data);
}

function _addToBlacklist(source){
  cacheService.addBlacklistedMember(source);
}

function _updateSourceRequestCount(activeMember, dest, port, payload){
  cacheService.createOrUpdateActiveMember(activeMember.source, {
      source: activeMember.source, 
      messages: activeMember.messages.concat([{dest: dest, port: port, payload: payload}])}
    );
}

function _removeFromActiveList(source){
  cacheService.removeFromActiveList(source);
}

async function _isValidSource(sourceObj){
  return (sourceObj.messages.length < process.env.THRESHOLD);
}

// Execute if ran directly for simple testing and debuging
if (typeof require !== 'undefined' && require.main === module) {

}

module.exports = filterRequest;