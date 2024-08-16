const { Router } = require('express');
const { CartManager } = require('../../controllers/CartManagerBD');

const cartsViewsRouter = Router();

cartsViewsRouter.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await CartManager.getPopulatedCartById(cid);
    let productsTotalCount = 0;
    let totalPrice = 0;
    let title = "APP -> ";
    if (cart) {
        title += "Carrito #" + cart._id;
        Object.values(cart.products).forEach(product => {
            productsTotalCount += parseInt(product.quantity);
            totalPrice += parseInt(product.product.price * product.quantity);
        })
    } else {
        title += "Carrito no válido"
    }
    const totalPriceWithTaxes = totalPrice * 1.23;
    res.render('cart', {
        cart: cart, title: title, productsTotal: productsTotalCount,
        totalPrice: totalPrice, totalPriceWithTaxes: totalPriceWithTaxes
    });
});

cartsViewsRouter.get('/*', (req, res) => {
    const title = "Sitio no encontrado 🔎";
    res.render('notFound404', { title: title });
});

module.exports = cartsViewsRouter;