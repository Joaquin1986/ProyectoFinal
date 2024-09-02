// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const { Router } = require('express');
const { Cart, CartManager } = require('../../controllers/CartManager');
const { Order, OrderManager } = require('../../controllers/OrderManager');
const { ProductManager } = require('../../controllers/ProductManager');

const cartsApiRouter = Router();

cartsApiRouter.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    if (cid) {
        try {
            const cart = await CartManager.getCartById(cid);
            if (cart) return res.status(200).json({ "products": cart.products });
            return res.status(404).json({ "⛔Error": `Carrito id '${cid}' no encontrado` });
        } catch (error) {
            res.status(500).json({ "⛔Error interno:": error.message });
        }
    } else {
        res.status(400).json({ "⛔Error:": "Request no válido" });
    }
});

cartsApiRouter.post("/carts", async (req, res) => {
    try {
        const newCart = new Cart();
        const result = await CartManager.addCart(newCart);
        result ? res.status(201).json({ "cartId": result }) : res.status(400).json({
            "⛔Error:":
                "Request no válido"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

cartsApiRouter.post("/carts/:cid/order", async (req, res) => {
    const { cid: cartId } = req.params;
    const { name, address, email, paymentMehod } = req.body;
    if (cartId && name && address && email && (paymentMehod.toLowerCase() === 'cash' || paymentMehod.toLowerCase() === 'card')) {
        try {
            const cartAlreadyOrdered = await OrderManager.isCartAldreadyOrdered(cartId);
            if (cartAlreadyOrdered) {
                return res.status(400).json({
                    "error":
                        "Orden ya finalizada"
                });
            }
            const cartExists = await CartManager.getPopulatedCartById(cartId);
            if (cartExists) {
                const newOrder = new Order(cartExists._id, name, address, email, paymentMehod.toLowerCase());
                const result = await OrderManager.addOrder(newOrder);
                if (result) {
                    ProductManager.updateOrderedProductsStock(cartExists.products);
                    res.status(201).json({ "order": result._id });
                }
            } else {
                res.status(400).json({
                    "error":
                        "Carrito no válido"
                });
            }
        } catch (error) {
            res.status(500).json({ "internalError": error.message });
        }
    } else {
        res.status(400).json({
            "error":
                "Request no válido, revisar valores enviados"
        });
    }
});


cartsApiRouter.put("/carts/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (cid && pid && quantity) {
        try {
            if (parseInt(quantity) < 1)
                return res.status(400).json({
                    "error":
                        "Cantidad no válida"
                });
            const cartAlreadyOrdered = await OrderManager.isCartAldreadyOrdered(cid);
            if (cartAlreadyOrdered) {
                return res.status(400).json({
                    "error":
                        "Orden ya finalizada"
                });
            }
            const result = await CartManager.addProductToCart(cid, pid, quantity);
            if (result === true) return res.status(200).json({ 'productAdded': pid, 'inCart': cid, 'quantity': quantity });
            else if (result === -1) return res.status(400).json({ 'error': 'Stock insuficiente' });
            return res.status(400).json({ 'error': 'Request no válido' });
        } catch (error) {
            return res.status(500).json({ "internalError": error.message });
        }
    } return res.status(400).json({ 'error': 'Request no válido' });
});


cartsApiRouter.put("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    const { body } = req;
    if (cid && (typeof body).toLowerCase() === 'object') {
        const products = Object.values(body);
        if (products.length === 0)
            return res.status(400).json({ 'error': 'Array vacío' });
        try {
            let totalResult = [];
            let count = 0;
            const cartAlreadyOrdered = await OrderManager.isCartAldreadyOrdered(cid);
            if (cartAlreadyOrdered) {
                return res.status(400).json({
                    "error":
                        "Orden ya finalizada"
                });
            }
            while (count < products.length) {
                if (products[count].product && products[count].quantity) {
                    try {
                        if (parseInt(products[count].quantity) < 1)
                            totalResult.push({ ...products[count], "result": "error: cantidad no válida" });
                        else {
                            const result = await CartManager.addProductToCart(cid, products[count].product, products[count].quantity);
                            if (result && result !== -1) totalResult.push({ ...products[count], "result": "success: producto agregado exitosamente" });
                            else if (result && result === -1) totalResult.push({ ...products[count], "result": "error: stock insuficiente" });
                            else totalResult.push({ ...products[count], "result": "error: producto inexistente" });
                        }
                    } catch (error) {
                        totalResult.push({ ...products[count], "result": "error:" + error.message });
                    }
                }
                else totalResult.push({ ...products[count], "result": "error: objeto incorrecto o mal formado" });
                count++;
            }
            return res.status(200).json({ 'result': totalResult });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ "internalError": error.message });
        }
    }
    else
        return res.status(400).json({ 'error': 'Request no válido' });
});

cartsApiRouter.delete("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const cartAlreadyOrdered = await OrderManager.isCartAldreadyOrdered(cid);
        if (cartAlreadyOrdered) {
            return res.status(400).json({
                "error":
                    "Orden ya finalizada"
            });
        }
        const result = await CartManager.deleteCart(cid);
        result.modifiedCount > 0 ? res.status(201).json({ "deletedCart": cid }) : res.status(400).json({
            "⛔Error:": "Request no válido"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

// Elimina un producto de un carrito
cartsApiRouter.delete("/carts/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cartExists = await CartManager.getCartById(cid);
        if (!cartExists)
            return res.status(400).json({ 'error': `Carrito #${cid} inexistente` });
        const cartAlreadyOrdered = await OrderManager.isCartAldreadyOrdered(cid);
        if (cartAlreadyOrdered)
            return res.status(400).json({ 'error': `Orden ya finalizada` });
        const isProductInCart = await CartManager.isProductInCart(cid, pid);
        if (isProductInCart) {
            const result = await CartManager.deleteProductFromCart(cid, pid);
            const newCart = await CartManager.getPopulatedCartById(cid);
            if (result) return res.status(200).json({ 'productRemoved': pid, 'fromCart': cid, "remainingProducts": newCart.products });
        }
        return res.status(400).json({ 'error': `Producto no se encuentra en el carrito #${cid}` });
    } catch (error) {
        return res.status(500).json({ "error interno": error.message });
    }
});

module.exports = cartsApiRouter;