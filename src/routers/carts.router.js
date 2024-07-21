const { Router } = require('express');
const { CartManager } = require('../CartManager');

const cartsRouter = Router();
const cm1 = new CartManager("./src/carts.json");

cartsRouter.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    if (cid) {
        try {
            const cart = await cm1.getCartById(cid);
            if (cart) return res.status(200).json(cart.products);
            return res.status(404).json({ "⛔Error": `Carrito id '${cid}' no encontrado` });
        } catch (error) {
            res.status(500).json({ "⛔Error interno:": error.message });

        }
    }
});

cartsRouter.post("/carts", async (req, res) => {
    try {
        const result = await cm1.addCart();
        result ? res.status(201).json({ "✅Carrito creado": result }) : res.status(500).json({
            "⛔Error:":
                "Hubo un error interno del servidor al crear el carrito"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

cartsRouter.post("/carts/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (cid && pid) {
        try {
            const result = await cm1.addProductToCart(cid, pid, quantity);
            if (result) return res.status(200).json({ "✅Cantidad agregada": `+${quantity} de producto '${pid}' al carrito '${cid}'` });
            if (result === undefined) return res.status(500).json({ "⛔Error": "Error: debe crear el archivo JSON utilizando el método POST '/api/carts/'" });
            return res.status(404).json({ "⛔Error": `Carrito id '${cid}' no encontrado` });
        } catch (error) {
            res.status(500).json({ "⛔Error interno:": error.message });
        }
    }
});

module.exports = cartsRouter;