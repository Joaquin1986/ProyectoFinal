const { Server } = require('socket.io');
const { ProductManager } = require('./controllers/ProductManager');

const initSocket = async (httpServer) => {
    const socketServer = new Server(httpServer);
    socketServer.on('connection', (socketClient) => {
        console.log(`Cliente conectado exitosamente 👍: id #${socketClient.id}`);
        socketClient.on('status', async (product, status) => {
            const result = await ProductManager.productStatus(product, status);
            socketServer.emit('status', product, result, status, socketClient.id);
        });
        socketClient.on('delete', async (product) => {
            const result = await ProductManager.deleteProduct(product)
            socketServer.emit('delete', product, result);
        });
        socketClient.on('newProduct', (productId) => { //luego sera async
            const newProduct = ProductManager.getProductById(productId)  //luego sera con await
            socketServer.emit('newProduct', newProduct, socketClient.id);
        });
    });
};

module.exports = initSocket;