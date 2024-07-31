const { Router } = require('express');
const { Product, ProductManager } = require('../../controllers/ProductManager');

const realTimeProductsViewRouter = Router();

realTimeProductsViewRouter.get('/realTimeProducts', async (req, res) => {
    const products = ProductManager.getProducts();
    const quantity = Object.keys(products).length;
    const title = 'APP -> Listado en Tiempo Real de Productos⌚📦';
    res.render('realTimeProducts', { title: title, products: products, quantity: quantity });
});

module.exports = realTimeProductsViewRouter;