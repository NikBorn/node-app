// Helpers for various tasks

// Dependencies 
const crypto = require('crypto');
const confit = require('../config.js')


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

// Export the module
module.exports = helpers;