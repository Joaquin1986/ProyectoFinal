const { Router } = require('express');
const { Product, ProductManager } = require('../../controllers/ProductManager');
const { uploadMulter, buildResponse } = require('../../utils/utils');

const productsApiRouter = Router();
const maxFilesAllowed = 5;


// Este Endpoint acepta por query param 'sort','limit', 'category' y 'available'. Para 'available',
// si se especifica, admite solamente true o false.
productsApiRouter.get("/products", async (req, res) => {
    let { limit, page, sort, category, available } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);
    let criteria = {};
    let options = {};
    if (!limit || limit < 1) limit = 10;
    if (!page || page < 1) page = 1;
    if (available && available.toLowerCase() === 'false')
        criteria = { "deleted": false };
    else
        criteria = { "status": true, "deleted": false };
    if (category)
        criteria = { ...criteria, "category": { '$regex': category, $options: 'i' } };
    if (sort && (sort.toLowerCase() !== 'asc' && sort.toLowerCase() !== 'desc')) sort = false;
    sort ? options = { "limit": limit, "page": page, sort: { "price": sort } }
        : options = { "limit": limit, "page": page };
    let response;
    try {
        response = buildResponse(await ProductManager.getPaginatedProducts(criteria, options), 'api', sort, category);
        return res.status(200).json(response);
    } catch {
        response = {
            status: "error",
            payload: [],
            totalPages: 0,
            prevPage: null,
            nextPage: null,
            page: 0,
            hasPrevPage: false,
            hasNextPage: false,
            prevLink: null,
            nextLink: null,
        };
        return res.status(500).json(response);
    }
});

productsApiRouter.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await
            ProductManager.getProductById(pid);
        if (product) return res.status(200).json(product);
        return res.status(404).json({ "Error": `Producto id #${pid} no encontrado` });
    } catch (error) {
        return res.status(500).json({ "Error interno": error.message });
    }
});

// Al siguiente endpoint (POST) se le puede pasar un array llamado 'thumbnails" por Multer
productsApiRouter.post("/products", uploadMulter.array('thumbnails'), async (req, res) => {
    const { body } = req;
    const { title, description, price, code, status, stock, category } = body;
    let newStatus = true;
    if (!title || !description || !parseInt(price) || !code || !parseInt(stock) || !category) {
        return res.status(400).json({
            "Error":
                "Petición incorrecta (los valores proporcionados no son los esperados)"
        });
    } else {
        try {
            if (status && typeof status !== 'boolean' && status.toLowerCase() === 'false')
                newStatus = false;
            const prod1 = new Product(title, description, parseInt(price), code, newStatus,
                parseInt(stock), category);
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
                "Error":
                    `Producto ya existente: ${prodFound.title} (codigo: ${prodFound.code})`
            });
        } catch (error) {
            return res.status(500).json({ "Error interno": error.message });
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
    if (!title && !description && !price && !code && !status && !stock && !deleteThumbIndex & !category)
        return res.status(400).json({ "Error": "petición incorrecta" });
    const deleteThumbIndexParsed = [];
    if (deleteThumbIndex && (typeof deleteThumbIndex).toLowerCase() !== 'string') {
        Object.values(deleteThumbIndex).forEach((value) => {
            deleteThumbIndexParsed.push(parseInt(value));
        });
    } else if (deleteThumbIndex && (typeof deleteThumbIndex).toLowerCase() === 'string') {
        deleteThumbIndexParsed.push(parseInt(deleteThumbIndex));
    }
    if (pid) {
        try {
            let statusNew = true;
            if (status && status.toLowerCase() === "false") statusNew = false;
            if (status && status.toLowerCase() === "true") statusNew = true;
            const prodFound = await ProductManager.getProductByIdNoStatus(pid);
            if (prodFound) {
                let thumbnailsTotalQuantity = Object.values(prodFound.thumbnails).length + req.files.length;
                if (req.files.length > maxFilesAllowed || thumbnailsTotalQuantity > maxFilesAllowed) return res.status(400).json({
                    "Error":
                        `Se superó el límite de imágenes permitido: ${maxFilesAllowed}`
                });
                if (title) {
                    prodFound.title = title;
                    changesDone.push(`Se modifica el nombre -> ${title}`);
                }
                if (description) {
                    prodFound.description = description;
                    changesDone.push(`Se modifica la descripcion -> ${description}`);
                }
                if (parseInt(price)) {
                    prodFound.price = parseInt(price);
                    changesDone.push(`Se modifica el precio -> $${price}`);
                }
                if (code && code !== prodFound.code) {
                    const codeExists = await ProductManager.productCodeExists(code);
                    if (codeExists) {
                        return res.status(400).json({
                            "Error":
                                "Código de producto ya existente"
                        });
                    } else {
                        prodFound.code = code;
                        changesDone.push(`Se modifica el código -> ${code}`);
                    }
                }
                if (status && (status.toLowerCase() === 'true' || status.toLowerCase() === 'false')) {
                    prodFound.status = status;
                    changesDone.push(`Se modifica el status a ${statusNew}`);
                } else if (status && (status.toLowerCase() !== 'true' && status.toLowerCase() !== 'false')) {
                    changesDone.push(`⛔Error: estado "${status}" no válido`);
                }
                if (parseInt(stock)) {
                    prodFound.stock = parseInt(stock);
                    changesDone.push(`Se modifica el stock a ${stock}`);
                }
                if (category) {
                    prodFound.category = category;
                    changesDone.push(`Se modifica la categoria a ${category}`);
                }
                if (req.files.length > maxFilesAllowed) {
                    return res.status(400).json({
                        "Error":
                            `Se superó el límite de thumbnails(${maxFilesAllowed})`
                    });
                }
                // En caso de pasar datos en 'deleteThumbIndex', se eliminan las thumbnails elegidas
                let deletedFiles = [];
                const thumbnailsObjValues = Object.values(prodFound.thumbnails);
                if (deleteThumbIndexParsed.length > 0) {
                    // Se eliminan los archivos de imagenes pasados por pa
                    deleteThumbIndexParsed.forEach(async (originalIndex) => {
                        let index = -1;
                        if (parseInt(originalIndex) > 0 && parseInt(originalIndex) <= thumbnailsObjValues.length) {
                            index = parseInt(originalIndex) - 1;
                        } else {
                            changesDone.push(`⛔Error al borrar: indice (${originalIndex}) fuera de rango`);
                        }
                        if (index >= 0 && index < thumbnailsObjValues.length) {
                            if (ProductManager.thumbnailExists(prodFound.thumbnails[index])) {
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
                        await ProductManager.removeThumbnailFromProduct(deletedFile.path, prodFound);
                    });
                }
                // Si hay thumbnails subidas por Multer, se agregan al producto
                if (req.files && req.files.length > 0) {
                    req.files.forEach((file) => {
                        const newPath = file.path.split("public")[1];
                        prodFound.thumbnails.push(newPath);
                        changesDone.push(`Se agrego el archivo ${newPath}`);
                    });
                }
                if (changesDone.length === 0) return res.status(201).json({ "Producto Actualizado": pid, "Cambios Realizados": "Ninguno" });
                const result = await ProductManager.updateProduct(prodFound);
                if (changesDone) {
                    console.log("🔄Cambios realizados: ");
                    changesDone.forEach((change) => console.log("- " + change + ""));
                }
                if (result) return res.status(201).json({ "Producto Actualizado": pid, "Cambios Realizados": changesDone });
                res.status(500).json({
                    "Error":
                        "El Producto '" + pid + "' no pudo ser actualizado"
                });
            }
            return res.status(404).json({ "Error": "Producto no encontrado" });
        } catch (error) {
            return res.status(500).json({ "Error interno": `${error}, ${error.message}` });
        }
    } else {
        return res.status(400).json({ "Error": "petición incorrecta" });
    }
});

productsApiRouter.delete("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    if (pid) {
        try {
            const result = await ProductManager.deleteProduct(pid);
            if (result) return res.status(200).json({ "Producto Eliminado": pid });
            return res.status(404).json({ "Error": `Producto id #${pid} no encontrado` });
        } catch (error) {
            return res.status(500).json({ "Error interno": error.message });
        }
    } else {
        res.status(400).json({ "Error": "no se recibio id de Producto válido" });
    }
});

module.exports = productsApiRouter;