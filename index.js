// 
// Primary File for the API
// 
// 
// 

// Dependencies

const http = require('http');
const url = require('url');

//The servier should respond to all requests with astring.

const server = http.createServer((request, response)=>{

  //Get url and parse it
  const parsedUrl = url.parse(request.url, true);

  //Get path from url
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //send the responsen
  response.end('Hello World\n');

  //console log the request path
  console.log('Request received on path: '+trimmedPath)

})

//Start the server and have it listening on port 300.

server.listen(3000, ()=>{
  console.log('The server is listening on port 3000')
})