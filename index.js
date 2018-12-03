// 
// Primary File for the API
// 
// 
// 

// Dependencies

const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs'); //file system that is built into Node.
const _data = require('./lib/data');

//TESTING
// @todo Delte this
_data.delete('test', 'newFile', (err)=>{
  console.log('this was the error ', err);
})

//Instantiate the HTTP server
const httpServer = http.createServer((request, response)=>{
  unifiedServer(request, response);
});

//Start the HTTP server 
httpServer.listen(config.httpPort, ()=>{
  console.log('The server is listening on port '+config.httpPort)
});

//Instantiate the HTTPS server
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions,(request, response) => {
  unifiedServer(request, response);
});

//Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log('The server is listening on port ' + config.httpsPort)
});


//All the servier logic for both the http and https server
const unifiedServer = (request, response) => {

  //Get url and parse it
  const parsedUrl = url.parse(request.url, true);

  //Get path from url
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get query string as an object
  const queryStringObject = parsedUrl.query;

  //Get the HTTP method
  const method = request.method.toLowerCase();

  //Get the headers as an object
  const headers = request.headers;

  //Get the payload, if there is any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  request.on('data', (data) => {
    buffer += decoder.write(data);
  })
  request.on('end', () => {

    buffer += decoder.end();

    //choose the handler this request should go to.  If one is not found use the notFound handler.
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    //Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      //Use the status code called back by the handler or default to 200.
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

      //Use the payload called back by the handler or default to an empty object.
      payload = typeof (payload) == 'object' ? payload : {};

      //Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      //Return the response
      response.setHeader('Content-Type', 'application/json')
      response.writeHead(statusCode);
      response.end(payloadString);

      //console log the request path
      console.log('Returning this response', statusCode, payloadString);

    })

  })
}

//Define handlers
const handlers = {};
//sample handler
handlers.sample = (data, callback) => {
  //callback HTTP status code and a payload object
  callback(406, {'name': 'sample handler'});

}
//not found handler
handlers.notFound = (data, callback) => {
  callback(404);
}

//Define a request router
const router = {
  'sample' : handlers.sample
}