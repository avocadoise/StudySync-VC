require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  // Wait for MongoDB before accepting API requests so auth queries do not buffer and time out.
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT.`);
    process.exit(1);
  }

  console.error(`Server failed to start: ${error.message}`);
  process.exit(1);
});

startServer();
