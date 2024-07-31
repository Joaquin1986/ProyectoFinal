// Se realizan los imports mediante 'require', de acuerdo a lo visto en clase
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readJsonDataFromFile, productsPath: path } = require('../utils/utils.js')

/* Si bien se que, cuando implementemos BD, la funcion de lectura sera asincronica, como en esta primer
   pre-entrega trabajamos con archivos, se lee de forma sincronica solamente la carga inicial de productos.
   El resto de las operaciones se ejecutan de forma asincrona*/
const file = 'products.json';
let products = readJsonDataFromFile(file);

// Clase Product, con su correspondiente contructor las props definidas en la consigna
class Product {
    constructor(title, description, price, code, stock, category) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnails = [];
        this.code = code;
        this.status = true;
        this.stock = stock;
        this.category = category;
    }
}

// Clase ProductManager con su constructor tal como se solicitó, con un array 'products' vacío
class ProductManager {

    // Agrega un producto al array 'products'
    static async addProduct(product) {
        let worked = true;
        let productAlreadyExist = products.find((item) => item.code === product.code);
        if (!productAlreadyExist) {
            try {
                products.push(product);
                await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"), "utf-8", null);
                console.log(`✅ Producto '${product.title}' agregado exitosamente`);
            } catch (error) {
                throw new Error(`⛔ Error: ${error.message}`);
            }
        } else {
            worked = false;
            console.error(`⛔ Error: Código de Producto ya existente (Código:'${productAlreadyExist.code}'|Producto:'${productAlreadyExist.title}')`);
        }
        return worked;
    }

    // Devuelve el array con todos los productos creados hasta el momento
    static getProducts() {
        return products;
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo a id proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    static getProductById(id) {
        let productFound = undefined;
        try {
            products.forEach(product => {
                if (product.id === id) productFound = product;
            });
            if (productFound === undefined) {
                console.error(`⛔ Error: Producto id #${id} no encontrado`);
            }
            return productFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con id: ${id} => error: ${error.message}`);
        }
    }

    // En caso de encontrarlo, devuelve un objeto 'Producto' de acuerdo al codigo proporcionado por argumento.
    // En caso de no encontrarlo, imprime error en la consola.
    static async getProductByCode(code) {
        let productFound = undefined;
        try {
            products.forEach(product => {
                product.code === code ? productFound = product : null;
            })
            if (productFound === undefined) {
                console.error(`⛔ Error: Codigo de producto ${code} no encontrado`);
            }
            return productFound;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con el código: ${code} => error: ${error.message}`);
        }
    }

    // Actualiza un producto que es pasado por parámetro en el archivo 'data.json'
    static async updateProduct(product) {
        let result = false;
        try {
            const index = products.findIndex(p => p.id === product.id);
            products[index] = product;
            await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"), "utf-8");
            console.log(`✅ Producto '${product.id}' actualizado exitosamente`);
            result = true;
            return result;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el producto => error: ${error.message}`);
        }
    }

    static async productStatus(productId, status) {
        try {
            const prodIndex = products.findIndex(product => product.id === productId);
            if (prodIndex === -1) return false;
            products[prodIndex].status = status;
            await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"), "utf-8");
            console.log(`✅ Producto id#'${products[prodIndex].id}' ahora tiene status "${status}"`);
            return true;
        } catch (error) {
            throw new Error(`⛔ Error: No se pudo actualizar el producto => error: ${error.message}`);
        }
    }

    static async deleteProduct(id) {
        let result = false;
        try {
            const productGotten = this.getProductById(id);
            if (productGotten === undefined) {
                console.error(`⛔ Error: No se pudo borrar el producto`);
                return result;
            } else {
                const index = products.findIndex(product => product.id === id);
                products.splice(index, 1);
                await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"), "utf-8");
                console.log(`✅ Producto #${id} eliminado exitosamente`);
                result = true;
                return result;
            }
        } catch {
            return result;
        }
    }

    static async productCodeExists(productCode) {
        try {
            let productCodeFound = false;
            products.forEach(product => {
                if (product.code === productCode) productCodeFound = true;
            });
            return productCodeFound;
        } catch {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con código: ${productCode}`);
        }
    }

    static async productIdExists(productId) {
        try {
            let productIdFound = false;
            products.forEach(product => {
                if (product.id === productId) productIdFound = true;
            });
            return productIdFound;
        } catch {
            throw new Error(`⛔ Error: No se pudo verificar si existe el producto con código: ${productCode}`);
        }
    }

    static existsThumbnail(path) {
        try {
            let exists = false;
            fs.existsSync(path) ? exists = true : exists = false;
            return exists;
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo verificar si existe la thumbnail ${path} => ${error.message}`);
        }
    }

    static async deleteThumbnail(path) {
        try {
            if (this.existsThumbnail(path)) {
                await fs.promises.unlink(path);
            }
        } catch (error) {
            throw new Error(`⛔ Error: no se pudo borrar la thumbnail ${path} => ${error.message}`);
        }
    }

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
}

module.exports = { Product, ProductManager, products }