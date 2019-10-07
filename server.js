var WebSocketServer = require('ws').Server;

// Set the websocket port
wss = new WebSocketServer({port: 8081});

// connection listener
wss.on('connection', function connection(ws) {

    // send whatever message we receive back
    ws.on('message', function incoming(message){
        console.log('received: %s', message);
        ws.send(message);
    });
    ws.send('Connected');
});






