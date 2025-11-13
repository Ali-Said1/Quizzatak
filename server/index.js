const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // allow all origins for dev
});

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Quizzatak server is running!');
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
