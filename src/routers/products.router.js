const { Router } = require('express');
const multer = require('multer')
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/thumbnails'))
    },
    filename: function (req, file, cb) {
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniquePreffix + '-' + file.originalname)
    }
})
const uploadMulter = multer({ storage: storage })

const { Product, ProductManager } = require('../ProductManager.js');
const { type } = require('os');
const { stat } = require('fs');
const { Console } = require('console');
const productsRouter = Router();
const pm1 = new ProductManager("./src/products.json");

productsRouter.get("/products", async (req, res) => {
    const { limit } = req.query;
    if (!limit || limit < 1) {
        const products = await pm1.getProducts();
        return res.status(200).json(products);
    }
    if (!parseInt(limit)) return res.status(400).json({ "⛔Error": "Límite establecido no válido" })
    const result = await pm1.getProducts();
    const products = result;
    const filteredProducts = products.slice(0, limit);
    return res.status(200).json(filteredProducts);
});

productsRouter.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    const product = await pm1.getProductById(pid)
    if (product) return res.status(200).json(product);
    return res.status(404).json({ "⛔Error": `Producto id #${pid} no encontrado` });
});

productsRouter.post("/products", async (req, res) => {
    const { body } = req;
    const { title, description, price, code, stock, category } = body;
    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({
            "⛔Error:":
                "Producto recibido no es válido. Propiedades vacías o sin definir"
        });
    } else {
        try {
            const prod1 = new Product(title, description, price, code, stock, category);
            const result = await pm1.addProduct(prod1);
            if (result) return res.status(201).json({ "✅Producto Creado: ": prod1.id });
            return res.status(400).json({
                "⛔Error:":
                    "Producto ya existente u ocurrió un problema al guardarlo en el FS"
            });
        } catch (error) {
            return res.status(500).json({ "⛔Error interno:": error.message });
        }
    }
});

productsRouter.put("/products/:pid", uploadMulter.single('thumbnail'), async (req, res) => {
    /*Este Router admite como opcional que se envíe el valor 'deleteThumbIndex" en el body,
    el cual corresponde a la posición (a partir del 1) de cierta thumbnail que se desee borrar.
    Unicos status permitidos: true o false. Valor por defecto siempre es true, a menos que se elija false
    */
    const changesDone = [];
    const { pid } = req.params
    const { body } = req;
    const { title, description, price, code, status, stock, deleteThumbIndex } = body;
    const deleteThumbIndexParsed = parseInt(deleteThumbIndex);
    if (pid) {
        try {
            let statusNew = true;
            if (status && status.toLowerCase() === "false") statusNew = false;
            if (status && status.toLowerCase() === "true") statusNew = true;
            existsId = await pm1.productIdExists(pid);
            if (existsId) {
                const prodFound = await pm1.getProductById(pid);
                if (prodFound.code !== code) return res.status(400).json({
                    "⛔Error:":
                        "No coincide id con codigo del producto recibido"
                });
                const existsCode = await pm1.productCodeExists(code);
                if (existsCode) {
                    if (!title || !description || !price || !code || !stock) {
                        return res.status(400).json({
                            "⛔Error:":
                                "Producto recibido no es válido. Propiedades vacías o sin definir"
                        });
                    } else {
                        const newProduct = new Product(title, description, price, code, stock);
                        //Se mantiene el mismo 'id' del Producto, ya que el contructor por defecto asigna uno único
                        newProduct.id = pid;
                        const thumbnailsObjValues = Object.values(prodFound.thumbnails);
                        thumbnailsObjValues.forEach((value) => {
                            newProduct.thumbnails.push(value);
                        });
                        newProduct.thumbnails = prodFound.thumbnails; //SE APUNTA A MEMORIA Y NO SE DUPLICA
                        if (prodFound.status !== statusNew) {
                            newProduct.status = statusNew;
                            changesDone.push(`Se modifica el status a ${status}`);
                        }
                        if (prodFound.description !== description) {
                            newProduct.description = description;
                            changesDone.push(`Se modifica la descripcion a ${description}`);
                        }
                        if (prodFound.price !== price) {
                            newProduct.price = price;
                            changesDone.push(`Se modifica el precio a $${price}`);
                        }
                        if (prodFound.stock !== stock) {
                            newProduct.stock = stock;
                            changesDone.push(`Se modifica el stock a ${stock}`);
                        }
                        //Si se elige borrar una foto por su indice por variable 'deleteThumbIndex'
                        if (deleteThumbIndexParsed && deleteThumbIndexParsed > 0 && deleteThumbIndexParsed <= thumbnailsObjValues.length) {
                            if (pm1.existsThumbnail(prodFound.thumbnails[deleteThumbIndexParsed - 1])) {
                                fileToDelete = newProduct.thumbnails[deleteThumbIndexParsed - 1];
                                await pm1.deleteThumbnail(newProduct.thumbnails[deleteThumbIndexParsed - 1]);
                            }
                            newProduct.thumbnails.splice(deleteThumbIndexParsed - 1, 1);
                            changesDone.push(`Se borro la imagen ${thumbnailsObjValues[deleteThumbIndexParsed - 1]}`);
                        } else if (deleteThumbIndexParsed && deleteThumbIndexParsed <= 0 || deleteThumbIndexParsed > thumbnailsObjValues.length) {
                            changesDone.push(`⛔Error: 'deleteThumbIndex' (${deleteThumbIndexParsed}) fuera de rango`);
                        }
                        //Si hay foto subida por multer, se agrega al producto especificado por URL
                        if (req.file) {
                            newProduct.thumbnails.push(req.file.path);
                            changesDone.push(`Se agrego el archivo ${req.file.path}`);
                        }
                        if (changesDone.length === 0) return res.status(201).json({ "✅Producto Actualizado: ": pid, "Cambios Realizados": "No fueron realizados cambios" });
                        const result = await pm1.updateProduct(newProduct);
                        if (result) return res.status(201).json({ "✅Producto Actualizado: ": pid, "Cambios Realizados": changesDone });
                        res.status(500).json({
                            "⛔Error:":
                                "El Producto '" + pid + "' no pudo ser actualizado"
                        });
                    }
                } else {
                    return res.status(404).json({ "⛔Error:": "Producto recibido no existe en la base" });
                }
            } else {
                return res.status(404).json({ "⛔Error:": "Producto recibido no existe en la base" });
            }
        } catch (error) {
            return res.status(500).json({ "⛔Error interno:": `${error}, ${error.message}` });
        }
    } else {
        return res.status(400).json({ "⛔Error:": "no se recibio un id de producto" });
    }
});

productsRouter.delete("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    if (pid) {
        try {
            const result = await pm1.deleteProduct(pid);
            if (result) return res.status(200).json({ "✅Producto Eliminado: ": pid });
            return res.status(404).json({ "⛔Error": `Producto id #${pid} no encontrado` });
        } catch (error) {
            return res.status(500).json({ "⛔Error interno:": error.message });
        }
    } else {
        res.status(400).json({ "⛔Error:": "no se recibio id de Producto válido" });
    }
});

module.exports = productsRouter;