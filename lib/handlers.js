// Request Handlers

// Depdendencies
const _data = require('./data');
const helpers = require('./helpers');


// Define handlers
const handlers = {};
// Users handler
handlers.users = (data, callback) => {
  console.log(data.method)
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: no
handlers._users.post = (data, callback) => {
  // check that all required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data)=> {
      if(err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword) {
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };
  
          // Store the user
          _data.create('users',phone,userObject,(err) => {
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User already exists
        callback(400, {'Error' : 'User with that phone number already exists'})
      }
    });

  } else {
    callback(400, {'Error' : 'Missing required fields'})
  }

};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Get the token from the headers
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number provided
    handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
      if(tokenIsValid) {
        // Look up user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it to the requester
            delete data.hashedPassword
            callback(200, data)

          } else {
            callback(404);
          }
        })
      } else {
        callback(403, {"Error" : "Missing required token in header or token is invalid"})
      }
    })


  } else {
    callback(400, {'Error' : 'Missing Phone Number'})
  }


};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)

handlers._users.put = (data, callback) => {
  // Check for the required field
  console.log(data)
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if(phone) {
    if(firstName || lastName || password) {
      // Get the token from the headers
      const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number provided
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update the required fields
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user.' });
                }
              })
            } else {
              callback(400, { 'Error': 'The specified user does not exist' });
            }
          });
        } else {
          callback(403, { "Error": "Missing required token in header or token is invalid" });
        }
      });
    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field(phone number)'})
  }
};

// Users - delete
// Required field - phone
//@TODO delete any other data files associated with this user.
handlers._users.delete = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the phone number provided
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Look up user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200)
              } else {
                callback(500, { 'Error': 'Could not delete the specified user.' })
              }
            })
          } else {
            callback(400, { 'Error': 'Could not find the specified user' });
          }
        })
       } else {
        callback(403, { "Error": "Missing required token in header or token is invalid" });
       }
      });
  } else {
    callback(400, { 'Error': 'Missing Phone Number' })
  }
};

// Tokens handler
handlers.tokens = (data, callback) => {
  console.log(data.method)
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405);
  }
};

// Container for all of the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if(phone && password) {
    // Look up the user who matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored inthe user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // If valid create a new token with a random name.  Set expiration data 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          }
          
          // Store the token
          _data.create('tokens', tokenId, tokenObject, (err)=>{
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, {'Error' : 'Could not create the new token.'})
            }
          })
        } else {
          callback(400, {'Error' : 'Password did not match the specified users stored password'})
        }


      } else {
        callback(400, {'Error' : 'Could not find the specified user.'})
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
};

// Tokens - get
handlers._tokens.get = (data, callback) => {
  // Check that id is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field, or field invalid' })
  }
};

// Tokens - put
// Required: id, extend
// Optional Data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend) {
    // Look up the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update('tokens', id, tokenData, (err)=>{
            if(!err) {
              callback(200) 
            } else {
              callback(500, {"Error" : "Could not update the tokens expiration."})
            }
          })
        } else {
          callback(400, {"Error" : "The token has expired and cannot be extended"})
        }
      } else {
        callback(400, { "Error" : "Specified token does not exist."});
      }
    });
  } else {
    callback(400, {"Error": "Missing required fields or fields are invalid."})
  }

};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Look up the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { 'Error': 'Could not delete the specified token.' })
          }
        })
      } else {
        callback(400, { 'Error': 'Could not find the specified token' });
      }
    })

  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};

// Verify if a given token id is currently valid for a given user.
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Look up the token
  _data.read('tokens', id, (err, tokenData)=> {
    if(!err && tokenData) {
      //Check that the token is for the given user and has not expired
      if(tokenData.phone === phone && tokenData.expires > Date.now()){
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })

}


// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};
// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;
