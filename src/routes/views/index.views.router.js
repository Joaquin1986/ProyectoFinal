const { Router } = require('express');
const { ProductManager } = require('../../controllers/ProductManager');

const homeViewRouter = Router();

homeViewRouter.get('/products', (req, res) => {
  const products = ProductManager.getProducts();
  const title = "APP -> Listado de Productos 📦";
  res.render('index', { products: products, title: title, quantity: Object.keys(products).length });
});

module.exports = homeViewRouter;