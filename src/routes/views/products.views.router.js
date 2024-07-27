const { Router } = require('express');
const { ProductManager } = require('../../controllers/ProductManager');

const productsRouter = Router();

productsRouter.get('/products', (req, res) => {
  const products = ProductManager.getProducts();
  const title = "APP -> Listado de Productos 📦";
  const quantity = products.length;
  res.render('products', { products: products, title: title, quantity: quantity });
});

module.exports = productsRouter;