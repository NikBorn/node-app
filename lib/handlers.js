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
//@TODO Only let an authenticated user access their object, not anyone else's.
handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
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
    callback(400, {'Error' : 'Missing Phone Number'})
  }


};

// Users - put
handlers._users.put = (data, callback) => {

};

// Users - delete
handlers._users.delete = (data, callback) => {

};

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