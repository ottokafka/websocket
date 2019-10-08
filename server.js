// this is the server for websocket.io run node server.js
//A UUID is used to identify each client that has connected to the server
const express = require('express');
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;

// // local dev port below disable when not in localhost
//     wss = new WebSocketServer({port: 8080});
// console.log("listening on port 8080");

var uuid = require('node-uuid');
const path = require('path');
const PORT = process.env.PORT || 5000;
const INDEX = path.join(__dirname, 'index.html');

// Main server if need localhost dev disable this or enable when finished and ready for heroku
const server = express()
    .use((req, res) => res.sendFile(INDEX) )
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// websocket takes in the express node server
const wss = new WebSocketServer({ server });
var clients = [];


function wsSend(type, client_uuid, nickname, message) {
    for ( let i = 0; i < clients.length; i++) {
    var clientSocket = clients[i].ws;
    if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
            "type": type,
            "id": client_uuid,
            "nickname": nickname,
            "message": message
        })); }
} }

var clientIndex = 1;

wss.on('connection', function(ws) {

    var client_uuid = uuid.v4();

    let randomNamesArr = ["🍎", "🍊", "🍌", "🍑", "🍆", "🥦", "🥛", "🐂", "🐷", "🐱", "🎩", "🐑", "🐶", "🐎", "👩", "👨", "💰", "👃", "🦢", "👂", "🤚", "😯", "🐯", "🏠", "👀", "🐲", "❤️", "🇨🇳", "🇺🇸"];

    //get length of array
    var randomNum = Math.floor((Math.random() * randomNamesArr.length) - 1);
    let nickname = randomNamesArr[randomNum];

    nickname = nickname + clientIndex;
    clientIndex+=1;
    clients.push({"id": client_uuid, "ws": ws, "nickname": nickname});
    console.log('client [%s] connected', client_uuid);
    var connect_message = nickname + " has connected";
    wsSend("notification", client_uuid, nickname, connect_message);


    ws.on('message', function(message) {
        if (message.indexOf('/nick') === 0) {
        var nickname_array = message.split(' ');
        if(nickname_array.length >= 2) {
            var old_nickname = nickname;
            nickname = nickname_array[1];
            var nickname_message = "Client "+old_nickname+" changed to "+nickname;
            wsSend("nick_update", client_uuid, nickname, nickname_message);
        }}
        else {
        wsSend("message", client_uuid, nickname, message);
    }
        // // Keep connection alive by sending time every second
        setInterval(function () {

            wsSend(console.log(new Date().toString()))
        }, 5000)
    });

    var closeSocket = function(customMessage) {
        for (var i=0; i<clients.length; i++) {
        if(clients[i].id === client_uuid) {
            var disconnect_message;
            if(customMessage) {
            disconnect_message = customMessage; }
            else {
            disconnect_message = nickname + " has disconnected";
        }
            wsSend("notification", client_uuid, nickname, disconnect_message);
            clients.splice(i, 1);
        }
    } }

    ws.on('close', function() { closeSocket();
    });
    process.on('SIGINT', function() {
        console.log("Closing things");
        closeSocket('Server has disconnected');
        process.exit();
    });
});
