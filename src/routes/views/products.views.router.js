const { Router } = require('express');
const { ProductManager } = require('../../controllers/ProductManager');
const { buildResponse } = require('../../utils/utils');

const productsViewsRouter = Router();
const splideCss = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css';

// Por defecto, siempre se muestran productos que estén activados (status=true)
productsViewsRouter.get('/products', async (req, res) => {
  let { limit, page, sort, category } = req.query;
  let criteria = { "status": true };
  let options = {};
  limit = parseInt(limit);
  page = parseInt(page);
  if (category)
    criteria = { "category": { '$regex': category, $options: 'i' }, "deleted": false, "status": true };
  else
    criteria = { "deleted": false, "status": true };
  if (sort && (sort.toLowerCase() !== 'asc' && sort.toLowerCase() !== 'desc')) sort = false;
  sort ? options = { "limit": limit, "page": page, lean: true, sort: { "price": sort } }
    : options = { "limit": limit, "page": page, lean: true };
  if (!limit || limit < 1) limit = 10;
  if (!page || page < 1) page = 1;
  const productsToDisplay = await ProductManager.getPaginatedProducts(criteria, options);
  const builtResponse = buildResponse(productsToDisplay, 'views', sort, category);
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