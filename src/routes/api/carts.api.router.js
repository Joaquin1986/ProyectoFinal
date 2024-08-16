// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const { Router } = require('express');
const { Cart, CartManager } = require('../../controllers/CartManagerBD');

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
        res.status(400).json({ "⛔Error:": "Request invalido" });
    }
});

cartsApiRouter.post("/carts", async (req, res) => {
    try {
        const newCart = new Cart();
        const result = await CartManager.addCart(newCart);
        result ? res.status(201).json({ "cartId": result }) : res.status(500).json({
            "⛔Error:":
                "Hubo un error interno del servidor al crear el carrito"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

// De acuerdo a la consigna, por ahora, solo suma de a 1 la cantidad
cartsApiRouter.put("/carts/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = 1;  // A VER QUE DICE LA LETRA; SINO SERIA => const { quantity } = req.body;
    try {
        const result = await CartManager.addProductToCart(cid, pid, quantity);
        if (result) return res.status(200).json({ 'productAdded': pid, 'inCart': cid, 'quantity': quantity });
        return res.status(400).json({ '⛔Error': 'Request no válido' });
    } catch (error) {
        return res.status(500).json({ "⛔Error interno:": error.message });
    }
});

cartsApiRouter.delete("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const result = await CartManager.deleteCart(cid);
        result.deletedCount > 0 ? res.status(201).json({ "deletedCart": cid }) : res.status(400).json({
            "⛔Error:": "Request no válido"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

// Elimina un producto de un carrito
cartsApiRouter.delete("/carts/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const isProductInCart = await CartManager.isProductInCart(cid, pid);
        if (isProductInCart) {
            const result = await CartManager.deleteProductFromCart(cid, pid);
            const newCart = await CartManager.getPopulatedCartById(cid);
            if (result) return res.status(200).json({ 'productRemoved': pid, 'fromCart': cid, "remainingProducts": newCart.products });
        }
        return res.status(400).json({ '⛔Error': 'Request no válido' });
    } catch (error) {
        return res.status(500).json({ "⛔Error interno:": error.message });
    }
});

module.exports = cartsApiRouter;