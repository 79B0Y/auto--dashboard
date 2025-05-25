require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Mongo connected"));

app.use('/api/config', require('./routes/config'));

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const server = http.createServer(app);
const ws = require('./ws');
ws.init(server);

server.listen(process.env.PORT || 3000, () => console.log("Server started"));
