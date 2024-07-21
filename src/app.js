// Se definen los modulos a importar
const express = require('express');
const productsRouter = require('./routers/products.router.js');
const cartsRouter = require('./routers/carts.router.js');

// Se crea el server Express
const app = express();
const PORT = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", productsRouter);
app.use("/api", cartsRouter);

app.listen(PORT, () => console.log(`El servidor está trabajando en el puerto ${PORT} ✅`));
