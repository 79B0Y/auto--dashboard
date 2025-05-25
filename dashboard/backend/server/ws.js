const WebSocket = require('ws');
let wss;

function init(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (socket, req) => {
    const url = new URL(req.url, 'http://localhost');
    const apiKey = url.searchParams.get('key');
    const ApiKey = require('./models/ApiKey');
    ApiKey.findOne({ apiKey }).then(doc => {
      if (!doc) return socket.close();
      socket.userId = doc.userId;
    });
  });
}

function notify(userId) {
  if (!wss) return;
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN && c.userId === userId) {
      c.send(JSON.stringify({ type: 'configUpdated', updatedAt: new Date().toISOString() }));
    }
  });
}

module.exports = { init, notify };
