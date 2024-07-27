// Se definen los modulos a importar
const express = require('express');
const handlebars = require('express-handlebars');
const productsApiRouter = require('./routes/api/products.api.router.js');
const cartsApiRouter = require('./routes/api/carts.api.router.js');
const indexViewRouter = require('./routes/views/index.views.router.js');
const productsViewRouter = require('./routes/views/products.views.router.js');
const { publicPath, viewsPath } = require("./utils/utils.js");

// Se crea el server Express con el puerto correspondiente
const app = express();
const port = 8080;

app.engine('handlebars', handlebars.engine());
app.set('views', viewsPath);
app.set('view engine', 'handlebars');

app.use(express.static(publicPath))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", productsApiRouter);
app.use("/api", cartsApiRouter);

app.use("/views", indexViewRouter);
app.use("/views", productsViewRouter);

app.listen(port, () => console.log(`La APP se encuentra en http://localhost:${port} ✅`));