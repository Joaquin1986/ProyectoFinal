// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const { Router } = require('express');
const { CartManager } = require('../../controllers/CartManager');
const { ProductManager } = require('../../controllers/ProductManager');

const cartsRouter = Router();

cartsRouter.get("/carts/:cid", (req, res) => {
    const { cid } = req.params;
    if (cid) {
        try {
            const cart =  CartManager.getCartById(cid);
            if (cart) return res.status(200).json({ "Productos": cart.products });
            return res.status(404).json({ "⛔Error": `Carrito id '${cid}' no encontrado` });
        } catch (error) {
            res.status(500).json({ "⛔Error interno:": error.message });

        }
    } else {
        res.status(400).json({ "⛔Error:": "Request invalido" });
    }
});

cartsRouter.post("/carts", async (req, res) => {
    try {
        const result = await CartManager.addCart();
        result ? res.status(201).json({ "✅Carrito creado": result }) : res.status(500).json({
            "⛔Error:":
                "Hubo un error interno del servidor al crear el carrito"
        });
    } catch (error) {
        res.status(500).json({ "⛔Error interno:": error.message });
    }
});

// De acuerdo a la consigna, por ahora, solo suma de a 1 la cantidad
cartsRouter.post("/carts/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = 1;
    if (cid && pid) {
        try {
            const result = await CartManager.addProductToCart(cid, pid, quantity);
            const prodAdded = ProductManager.getProductById(pid);
            if (result) return res.status(200).json({ "✅Cantidad agregada": `+${quantity} de '${prodAdded.title}' al carrito #${cid}` });
            if (result === undefined) return res.status(500).json({ "⛔Error": "Error: debe crear primero algún carrito (POST '/api/carts/')" });
            return res.status(404).json({ "⛔Error": `Carrito id '${cid} o producto ${pid} no encontrado` });
        } catch (error) {
            return res.status(500).json({ "⛔Error:": error.message });
        }
    } else {
        res.status(400).json({ "⛔Error:": "Request invalido" });
    }
});

module.exports = cartsRouter;