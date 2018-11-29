// 
// Primary File for the API
// 
// 
// 

// Dependencies

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//The servier should respond to all requests with astring.

const server = http.createServer((request, response)=>{

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

  request.on('data', (data)=>{
    buffer += decoder.write(data);
  })
  request.on('end', ()=>{

    buffer += decoder.end();

    //choose the handler this request should go to.  If one is not found use the notFound handler.
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    //Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload)=>{
      //Use the status code called back by the handler or default to 200.
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //Use the payload called back by the handler or default to an empty object.
      payload = typeof(payload) == 'object' ? payload : {};
      
      //Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      //send the response
      response.writeHead(statusCode);

      response.end(payloadString);

      //console log the request path
      console.log('Returning this response', statusCode, payloadString);

    })
    
  })

})

//Start the server and have it listening on port 300.

server.listen(3000, ()=>{
  console.log('The server is listening on port 3000')
})


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