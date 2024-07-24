// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { Product, ProductManager } = require('../ProductManager.js');

/* Se configura Multer para que los guarde en el directorio 'public/thumbnails' y que mantenga el
nombre de los archivos, agregando un sufijo para asegurar que sea únicos */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/thumbnails'));
    },
    filename: function (req, file, cb) {
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniquePreffix + '-' + file.originalname);
    }
})
const uploadMulter = multer({ storage: storage })

const productsRouter = Router();

productsRouter.get("/products", async (req, res) => {
    const { limit } = req.query;
    if (!limit || limit < 1) {
        const products = await ProductManager.getProducts();
        if (products.length === 0) return res.status(200).json({ "Productos": "Sin productos creados" });
        return res.status(200).json({ "Productos": products });
    }
    if (!parseInt(limit)) return res.status(400).json({ "⛔Error": "Límite establecido no válido" })
    const result = await ProductManager.getProducts();
    const products = result;
    const filteredProducts = products.slice(0, limit);
    return res.status(200).json(filteredProducts);
});

productsRouter.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    const product = await ProductManager.getProductById(pid)
    if (product) return res.status(200).json(product);
    return res.status(404).json({ "⛔Error": `Producto id #${pid} no encontrado` });
});

// Al siguiente endpoint (POST) se le puede pasar un array llamado 'thumbnails" por Multer
productsRouter.post("/products", uploadMulter.array('thumbnails'), async (req, res) => {
    const { body } = req;
    const { title, description, price, code, stock, category } = body;
    if (!title || !description || !price || !code || !stock || !category) {
        return res.status(400).json({
            "⛔Error:":
                "Producto recibido no es válido. Propiedades vacías o sin definir"
        });
    } else {
        try {
            const prod1 = new Product(title, description, parseInt(price), code, parseInt(stock), category);
            // Si hay thumbnails subidas por Multer, se agregan al producto
            if (req.files.length > 0) {
                req.files.forEach((file) => {
                    prod1.thumbnails.push(file.path);
                });
            }
            const result = await ProductManager.addProduct(prod1);
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

/* El siguiente endpoint (put) admite de forma opcional que se envíe el valor 'deleteThumbIndex" en el body,
   el cual corresponde a la posición (a partir del 1) de cierta thumbnail que se desee borrar.
   Unicos status permitidos: true o false. Valor por defecto siempre es true, a menos que se elija false.*/

productsRouter.put("/products/:pid", uploadMulter.array('thumbnails'), async (req, res) => {
    const changesDone = [];
    const { pid } = req.params
    const { body } = req;
    const { title, description, price, code, status, stock, deleteThumbIndex, category } = body;
    const deleteThumbIndexParsed = [];
    if (deleteThumbIndex) {
        Object.values(deleteThumbIndex).forEach((value) => {
            deleteThumbIndexParsed.push(parseInt(value));
        });
    }
    if (pid) {
        try {
            let statusNew = true;
            if (status && status.toLowerCase() === "false") statusNew = false;
            if (status && status.toLowerCase() === "true") statusNew = true;
            existsId = await ProductManager.productIdExists(pid);
            if (existsId) {
                const prodFound = await ProductManager.getProductById(pid);
                if (prodFound.code !== code) return res.status(400).json({
                    "⛔Error:":
                        "No coincide id con codigo del producto recibido"
                });
                const existsCode = await ProductManager.productCodeExists(code);
                if (existsCode) {
                    if (!title || !description || !price || !code || !stock || !category) {
                        return res.status(400).json({
                            "⛔Error:":
                                "Producto recibido no es válido. Propiedades vacías o sin definir"
                        });
                    } else {
                        const newProduct = new Product(title, description, price, code, stock, category);
                        //Se mantiene el mismo 'id' del Producto, ya que el contructor por defecto asigna uno único
                        newProduct.id = pid;
                        const thumbnailsObjValues = Object.values(prodFound.thumbnails);
                        thumbnailsObjValues.forEach((value) => {
                            newProduct.thumbnails.push(value);
                        });
                        if (prodFound.status !== statusNew) {
                            newProduct.status = statusNew;
                            changesDone.push(`Se modifica el status a ${statusNew}`);
                        }
                        if (prodFound.title !== title) {
                            newProduct.title = title;
                            changesDone.push(`Se modifica el nombre a ${title}`);
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
                        if (prodFound.category !== category) {
                            newProduct.category = category;
                            changesDone.push(`Se modifica la categoria a ${category}`);
                        }
                        // En caso de pasar datos en 'deleteThumbIndex', se eliminan las thumbnails elegidas
                        let deletedFiles = [];
                        if (deleteThumbIndexParsed.length > 0) {
                            // Se eliminan los archivos de imagenes pasados por pa
                            deleteThumbIndexParsed.forEach(async (indexOriginal) => {
                                let index = 0;
                                if (parseInt(indexOriginal) > 0 && parseInt(indexOriginal) <= thumbnailsObjValues.length) {
                                    index = parseInt(indexOriginal) - 1;
                                } else {
                                    changesDone.push(`⛔Error al borrar: indice (${indexOriginal}) fuera de rango`);
                                }
                                if (index >= 0 && index < thumbnailsObjValues.length) {
                                    if (ProductManager.existsThumbnail(prodFound.thumbnails[index])) {
                                        fileToDelete = prodFound.thumbnails[index];
                                        deletedFiles.push({ "status": true, "path": fileToDelete })
                                        await ProductManager.deleteThumbnail(fileToDelete);
                                    } else {
                                        deletedFiles.push({ "status": false, "path": prodFound.thumbnails[index] })
                                    }
                                }
                            });
                            // Se eliminan las referencias a los archivos en el objeto
                            deletedFiles.forEach(async (deletedFile) => {
                                if (deletedFile.status) {
                                    changesDone.push(`Se borro la imagen ${deletedFile.path} de ${prodFound.title} `);
                                }
                                else {
                                    changesDone.push(`Se borro la imagen ${deletedFile.path} del objeto ${prodFound.title} (no se encontraba el archivo)`);
                                }
                                await ProductManager.removeThumbnailFromProduct(deletedFile.path, newProduct);
                            });
                        }

                        // Si hay thumbnails subidas por Multer, se agregan al producto
                        if (req.files.length > 0) {
                            req.files.forEach((file) => {
                                newProduct.thumbnails.push(file.path);
                                changesDone.push(`Se agrego el archivo ${file.path}`);
                            });
                        }
                        if (changesDone.length === 0) return res.status(201).json({ "✅Producto Actualizado: ": pid, "Cambios Realizados": "Ninguno" });
                        const result = await ProductManager.updateProduct(newProduct);
                        if (changesDone) {
                            console.log("🔄Cambios realizados: ");
                            changesDone.forEach((change) => console.log("- " + change + ""));
                        }
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
            const result = await ProductManager.deleteProduct(pid);
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