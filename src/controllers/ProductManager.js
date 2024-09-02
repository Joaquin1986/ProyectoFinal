const fs = require('fs');
const mongoose = require('mongoose');
const productModel = require('../models/product.model.js');

// Clase Product, con su correspondiente contructor las props definidas en la consigna
class Product {
    constructor(title, description, price, code, status, stock, category) {
        if (status === undefined) {
            status = true;
        }
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnails = [];
        this.code = code;
        this.status = status;
        this.stock = stock;
        this.category = category;
        this.deleted = false;
    }
}

// Clase ProductManager con su constructor tal como se solicitó, con un array 'products' vacío
class ProductManager {

    // Agrega un producto a la BD
    static async addProduct(product) {
        let worked = true;
        try {
            let productAlreadyExist = await this.getProductByCode(product.code);
            if (!productAlreadyExist) {
                worked = await productModel.create(product);
                console.log(`✅ Producto '  ${product.title}' agregado exitosamente`);
            } else {
                worked = false;
                console.error(`⛔ Error: Código de Producto ya existente (Código:'${productAlreadyExist.code}'|Producto:'${productAlreadyExist.title}')`);
            }
            return worked;
        } catch (error) {
            console.log(error)
            throw new Error(`⛔ Error: ${error.message}`);
        }
    }

    // Devuelve todos los productos creados hasta el momento en la BD
    static async getProducts() {
        try {
            return await productModel.find({ deleted: false }).lean();
        } catch (error) {
            throw new Error(`⛔ Error al obtener datos de la BD: ${error.message}`);
        }
    }

    // Devuelve los productos con paginate el plugin
    static async getPaginatedProducts(criteria, options) {
        try {
            return await productModel.paginate(criteria, options);
        } catch (error) {
            throw new Error(`⛔ Error al obtener datos de la BD: ${error.message}`);
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo a id proporcionado por argumento.
    static async getProductById(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                return await productModel.findOne({ _id: id, deleted: false, status: true }).lean();
            }
            return undefined;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con id: ${id} => error: ${error.message}`);
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo a id proporcionado por argumento.
    static async getProductByIdNoStatus(id) {
        try {
            if (mongoose.isValidObjectId(id)) {
                return await productModel.findOne({ _id: id, deleted: false }).lean();
            }
            return undefined;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con id: ${id} => error: ${error.message}`);
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo al codigo proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    static async getProductByCode(code) {
        return await productModel.findOne({ code: { '$regex': code, $options: 'i' }, deleted: false }).lean();
    } catch(error) {
        throw new Error(`⛔ Error: No se pudo verificar si existe el producto con el código: ${code} => error: ${error.message}`);
    }

    // Actualiza un producto que es pasado por parámetro en la BD
    static async updateProduct(product) {
        try {
            const result = await productModel.updateOne({ _id: product._id, deleted: false }, { $set: product });
            console.log(`✅ Producto id#${product._id} actualizado exitosamente`);
            return result.acknowledged;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el producto => error: ${error.message}`);
        }
    }

    // Modifica el estado de un Producto en la BD
    static async productStatus(productId, status) {
        try {
            const result = await productModel.updateOne({ _id: productId }, { status: status });
            console.log(`✅ Producto id#${productId} ahora tiene status "${status}"`);
            return result.acknowledged;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el producto => error: ${error.message}`);
        }
    }

    // Elimina la thumbnail de acuerdo a la ruta (path) que se le pasa por argumento
    static async deleteThumbnail(path) {
        try {
            if (this.thumbnailExists(path)) {
                await fs.promises.unlink(path);
            }
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo borrar la thumbnail ${path} => ${error.message}`);
        }
    }

    // Elimina un producto de acuerdo al id que se le pasa por argumento
    static async deleteProduct(id) {
        let result = false;
        try {
            if (mongoose.isValidObjectId(id)) {
                const productToDelete = await this.getProductByIdNoStatus(id);
                if (productToDelete) {
                    const res = await productModel.updateOne({ _id: id }, { $set: { deleted: true } });
                    console.log(`✅ Producto #${id} eliminado exitosamente`);
                    result = true;
                }
            }
            return result;
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo eliminar el producto id#${id} => ${error.message}`);
        }
    }

    // Devuelve 'true' si un código de Producto existe en la BD. Caso contrario, devuelve 'false'
    static async productCodeExists(productCode) {
        try {
            const productFound = await productModel.findOne({ code: { '$regex': productCode, $options: 'i' }, deleted: false });
            if (productFound) return true;
            else return false;
        } catch {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con código: ${productCode}`);
        }
    }

    // Devuelve 'true' si una thumnail de Producto existe en cierta ruta(path). Caso contrario, devuelve 'false'
    static thumbnailExists(path) {
        try {
            let exists = false;
            fs.existsSync(path) ? exists = true : exists = false;
            return exists;
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo verificar si existe la thumbnail ${path} => ${error.message}`);
        }
    }

    // Elimina una thumbnail de un obj producto que se reciben por argumento
    static async removeThumbnailFromProduct(path, product) {
        const pathParsed = String(path).toLowerCase();
        let index = 0;
        let found = false;
        while (index < product.thumbnails.length && !found) {
            const thumbnailParsed = String(product.thumbnails[index]).toLowerCase();
            if (thumbnailParsed === pathParsed) {
                found = true;
                product.thumbnails.splice(index, 1);
            }
            index++;
        }
        return product;
    }

    // Actualiza el stock de productos luego de haber recibido una orden
    static async updateOrderedProductsStock(products) {
        try {
            for (let count = 0; count < products.length; count++) {
                const newStock = products[count].product.stock - products[count].quantity;
                await productModel.updateOne({ _id: products[count].product._id }, { $set: { stock: newStock } });
            }
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el stock de los productos: ${error.message}`);
        }
    }
}

module.exports = {
    Product, ProductManager
}