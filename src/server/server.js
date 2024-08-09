const http = require('http');
const initSocket = require('../socket/socket.js');

const initServer = async (app) => {
    const server = http.createServer(app);
    const port = 8080;
    await initSocket(server);
    server.listen(port, () => console.log(`Servidor online y disponible en http://localhost:${port} ✅`));
}

module.exports = initServer;