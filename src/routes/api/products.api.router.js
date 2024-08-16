const { Router } = require('express');
const { Product, ProductManager } = require('../../controllers/ProductManagerDB');
const { uploadMulter } = require('../../utils/utils');

const productsApiRouter = Router();
const maxFilesAllowed = 5;

productsApiRouter.get("/products", async (req, res) => {
    const { limit } = req.query;
    if (!limit || parseInt(limit) === 0) {
        const products = await ProductManager.getProducts().lean();
        if (products.length === 0) return res.status(200).json({ "Productos": "Sin productos creados" });
        return res.status(200).json({ "Productos": products });
    }
    if (!parseInt(limit) || limit < 1) return res.status(400).json({ "⛔Error": "Límite establecido no válido" })
    const result = await ProductManager.getProducts();
    const products = result;
    const filteredProducts = products.slice(0, limit);
    return res.status(200).json(filteredProducts);
});

productsApiRouter.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    const product = await ProductManager.getProductById(pid);
    if (product) return res.status(200).json(product);
    return res.status(404).json({ "⛔Error": `Producto id #${pid} no encontrado` });
});

// Al siguiente endpoint (POST) se le puede pasar un array llamado 'thumbnails" por Multer
productsApiRouter.post("/products", uploadMulter.array('thumbnails'), async (req, res) => {
    const { body } = req;
    const { title, description, price, code, status, stock, category } = body;
    let newStatus = true;
    if (!title || !description || !parseInt(price) || !code || !parseInt(stock) || !category) {
        return res.status(400).json({
            "⛔Error:":
                "Petición incorrecta (los valores proporcionados no son los esperados)"
        });
    } else {
        try {
            if (status && status.toLowerCase() === 'false') {
                newStatus = false;
            }
            const prod1 = new Product(title, description, parseInt(price), code, newStatus, parseInt(stock), category);
            // Si hay thumbnails subidas por Multer, se agregan al producto
            if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                    const newPath = file.path.split("public")[1];
                    prod1.thumbnails.push(newPath);
                });
            }
            const result = await ProductManager.addProduct(prod1);
            if (result) {
                console.log("✅Producto Creado --> id#" + result._id);
                return res.status(201).json({ "productId": result._id });
            }
            const prodFound = await ProductManager.getProductByCode(prod1.code);
            return res.status(400).json({
                "⛔Error:":
                    `Producto ya existente: ${prodFound.title} (codigo: ${prodFound.code})`
            });
        } catch (error) {
            return res.status(500).json({ "⛔Error interno:": error.message });
        }
    }
});

/* El siguiente endpoint (put) admite de forma opcional que se envíe el argumento 'deleteThumbIndex'
   en el body, el cual corresponde a la posición (a partir de 1) de cierta thumbnail que se desee borrar.
   Se pueden enviar también los valores  'deleteThumbIndex' como un array.
   Unicos status permitidos: true o false. Valor por defecto siempre es true, a menos que se especifique false.*/

   productsApiRouter.put("/products/:pid", uploadMulter.array('thumbnails'), async (req, res) => {
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
                let thumbnailsTotalQuantity = Object.values(prodFound.thumbnails).length + req.files.length;
                if (req.files.length > maxFilesAllowed || thumbnailsTotalQuantity > maxFilesAllowed) return res.status(400).json({
                    "⛔Error:":
                        `Se superó el límite de imágenes permitido: ${maxFilesAllowed}`
                });
                if (prodFound.code !== code) return res.status(400).json({
                    "⛔Error:":
                        "No coincide id con codigo del producto recibido"
                });
                const existsCode = await ProductManager.productCodeExists(code);
                if (existsCode) {
                    if (!title || !description || !parseInt(price) || !code || !parseInt(stock) ||
                        !category || req.files.length > maxFilesAllowed) {
                        return res.status(400).json({
                            "⛔Error:":
                                `Petición recibida no es válida, revisar que no falte data o que no se supere el límite de thumbnails(${maxFilesAllowed})`
                        });
                    } else {
                        const newProduct = new Product(title, description, parseInt(price), code, statusNew, parseInt(stock), category);
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
                        if (prodFound.price !== parseInt(price)) {
                            newProduct.price = parseInt(price);
                            changesDone.push(`Se modifica el precio a $${price}`);
                        }
                        if (prodFound.stock !== parseInt(stock)) {
                            newProduct.stock = parseInt(stock);
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
                        if (req.files && req.files.length > 0) {
                            req.files.forEach((file) => {
                                const newPath = file.path.split("public")[1];
                                newProduct.thumbnails.push(newPath);
                                changesDone.push(`Se agrego el archivo ${newPath}`);
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
                }
            }
            return res.status(404).json({ "⛔Error:": "Producto no encontrado" });
        } catch (error) {
            return res.status(500).json({ "⛔Error interno:": `${error}, ${error.message}` });
        }
    } else {
        return res.status(400).json({ "⛔Error:": "petición incorrecta" });
    }
});

productsApiRouter.delete("/products/:pid", async (req, res) => {
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

module.exports = productsApiRouter;