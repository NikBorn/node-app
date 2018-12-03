// Helpers for various tasks

// Dependencies 
const crypto = require('crypto');
const config = require('./config.js')


// Container for all the helpers

const helpers = {};

//create a SHA256 hash
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    false;
  }
};

//Parse a JSON string in all cases without throwing an error
helpers.parseJsonToObject = (str) => {
  try{
    const obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }

};

// Export the module
module.exports = helpers;