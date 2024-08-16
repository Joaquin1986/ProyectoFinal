// Se definen los modulos a importar
const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const productsApiRouter = require('./routes/api/products.api.router.js');
const cartsApiRouter = require('./routes/api/carts.api.router.js');
const productsViewsRouter = require('./routes/views/products.views.router.js');
const cartsViewsRouter = require('./routes/views/carts.views.router.js');
const { publicPath, viewsPath } = require("./utils/utils.js");
const initServer = require('./server/server.js');
const connectMongoDB = require('./db/mongodb.js');

// Se crea el server Express con el puerto correspondiente
const app = express();

initServer(app).then(() => {
    connectMongoDB();
    app.engine('handlebars', handlebars.engine());
    app.set('views', viewsPath);
    app.set('view engine', 'handlebars');

    app.use(express.static(publicPath))
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', productsApiRouter);
    app.use('/api', cartsApiRouter);
    app.use('/views', productsViewsRouter);
    app.use('/views', cartsViewsRouter);

    app.use(("*", (req, res, next) => {
        const errorPath = path.join(__dirname, req.originalUrl);
        const message = `⛔ Error 404: Sitio no encontrado (${errorPath})`;
        console.error(message);
        res.status(404).json({ message });
    }));

    app.use((error, req, res, next) => {
        const message = `⛔ Error desconocido: ${error.message}`;
        console.error(message);
        res.status(500).json({ message });
    });

});

module.exports = app;