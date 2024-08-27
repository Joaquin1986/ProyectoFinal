const { Router } = require('express');
const { ProductManager } = require('../../controllers/ProductManager');
const { buildResponseForView } = require('../../utils/utils');

const productsViewsRouter = Router();
const splideCss = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css';

productsViewsRouter.get('/products', async (req, res) => {
  let { limit, page } = req.query;
  if (!limit || parseInt(limit) < 1) limit = 10;
  if (!page || parseInt(page) < 1) page = 1;
  const enabledProducts = await ProductManager.getEnabledProducts(parseInt(limit), parseInt(page));
  const builtResponse = buildResponseForView(enabledProducts);
  const { payload, ...details } = builtResponse;
  const title = "APP -> Listado de Productos 📦";
  res.render('index', { products: payload, title: title, details: details });
});

productsViewsRouter.get('/products/:pid', async (req, res) => {
  const { pid } = req.params;
  const product = await ProductManager.getProductById(pid);
  let title = "APP -> ";
  if (product) {
    title += "Detalle de " + product.title;
  } else {
    title += "Producto no válido"
  }
  res.render('productDetail', { product: product, title: title, splideCss: splideCss });
});

productsViewsRouter.get('/realTimeProducts', async (req, res) => {
  const products = await ProductManager.getProducts();
  const title = 'APP -> Listado en Tiempo Real de Productos⌚📦';
  res.render('realTimeProducts', { title: title, products: products });
});

module.exports = productsViewsRouter;