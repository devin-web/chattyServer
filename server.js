// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.onmessage = function (event) {
    var parsedJSON = JSON.parse( event.data );
    // console.log( "Message from client:", parsedJSON )
    // console.log( "or", event.data );
    //console.log( "User", parsedJSON.username, "said", parsedJSON.content, "uuid:", uuid.v4() );

    switch( parsedJSON.type ){

    case "postMessage":
      wss.broadcast( JSON.stringify( {
        type: "incomingMessage",
        id: uuid.v4(),
        username: parsedJSON.username,
        content: parsedJSON.content
      }));
      break;

    case "postNotification":
      wss.broadcast( JSON.stringify( {
        type: "incomingNotification",
        id: uuid.v4(),
        content: parsedJSON.content
      }));
      break;

    default:
      console.log("Error, received a packet with an unknown type" );
    }

  }
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});

