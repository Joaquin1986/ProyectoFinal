const { Router } = require('express');
const { ProductManager } = require('../../controllers/ProductManager');

const homeViewRouter = Router();

homeViewRouter.get('/', (req, res) => {
  const products = ProductManager.getProducts();
  const title = "APP -> Listado de Productos 📦";
  res.render('home', { products: products, title: title, quantity: Object.keys(products).length });
});

module.exports = homeViewRouter;