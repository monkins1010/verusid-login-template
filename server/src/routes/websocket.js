const express = require('express');
const expressWs = require('express-ws');
// Create a ws server to dynamically login the user

const app = express();
expressWs(app);
const registeredChallengeIDs = new Set();
const clients = new Map();

module.exports.app = app.ws('/awaitlogin/:challengeid', (ws, req) => {
  const { challengeid } = req.params;
  console.log(`WebSocket challengeid connected ${challengeid}`);

  ws.params = challengeid;
  clients.set(ws);

  ws.on('message', (data) => {
    console.log(`Received message: ${data}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });
});


module.exports.registeredChallengeIDs = registeredChallengeIDs;
module.exports.clients = clients;

