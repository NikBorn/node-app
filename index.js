// 
// Primary File for the API
// 
// 
// 

// Dependencies

const http = require('http')

//The servier should respond to all requests with astring.

const server = http.createServer((request, response)=>{
  response.end('Hello World\n')
})

//Start the server and have it listening on port 300.

server.listen(3000, ()=>{
  console.log('The server is listening on port 3000')
})